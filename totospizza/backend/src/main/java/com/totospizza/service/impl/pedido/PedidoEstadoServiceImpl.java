package com.totospizza.service.impl.pedido;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import com.totospizza.constant.ParametroClaves;
import com.totospizza.dto.request.operacion.CambiarEstadoPedidoRequest;
import com.totospizza.dto.response.pedido.PedidoResponse;
import com.totospizza.exception.RecursoNoEncontradoException;
import com.totospizza.exception.ReglaNegocioException;
import com.totospizza.model.embeddable.Direccion;
import com.totospizza.model.entity.operacion.Entrega;
import com.totospizza.model.entity.pedido.Pedido;
import com.totospizza.model.entity.pedido.PedidoEstadoHistorial;
import com.totospizza.model.enums.EstadoEntrega;
import com.totospizza.model.enums.EstadoPago;
import com.totospizza.model.enums.EstadoPedido;
import com.totospizza.model.enums.Rol;
import com.totospizza.model.enums.TipoEntrega;
import com.totospizza.model.enums.TipoNotificacion;
import com.totospizza.repository.operacion.EntregaRepository;
import com.totospizza.repository.pedido.PedidoEstadoHistorialRepository;
import com.totospizza.repository.pedido.PedidoRepository;
import com.totospizza.repository.seguridad.UsuarioRepository;
import com.totospizza.rules.calculator.CalculadoraDistancia;
import com.totospizza.rules.generator.CodigoEntregaGenerator;
import com.totospizza.rules.policy.PedidoEstadoPolicy;
import com.totospizza.service.configuracion.ParametrosService;
import com.totospizza.service.operacion.InventarioService;
import com.totospizza.service.operacion.NotificacionService;
import com.totospizza.service.pedido.PedidoEstadoService;

@Service
@RequiredArgsConstructor
@Transactional
public class PedidoEstadoServiceImpl implements PedidoEstadoService {

    private final PedidoRepository pedidoRepository;
    private final PedidoEstadoHistorialRepository historialRepository;
    private final EntregaRepository entregaRepository;
    private final UsuarioRepository usuarioRepository;
    private final InventarioService inventarioService;
    private final NotificacionService notificacionService;
    private final ParametrosService parametros;
    private final PedidoAssembler pedidoAssembler;
    private final Clock clock;

    @Override
    public void registrarCreacion(Pedido pedido) {
        registrarHistorial(pedido, EstadoPedido.PENDIENTE_PAGO, pedido.getCliente().getId(), "Pedido creado");
    }

    @Override
    public Pedido confirmarPago(Long pedidoId) {
        return avanzar(pedidoId, EstadoPedido.CONFIRMADO, null, "Pago aprobado");
    }

    @Override
    public Pedido avanzar(Long pedidoId, EstadoPedido nuevo, Long usuarioId, String comentario) {
        Pedido pedido = pedidoBloqueado(pedidoId);
        PedidoEstadoPolicy.validar(pedido.getEstado(), nuevo, pedido.getTipoEntrega());
        pedido.setEstado(nuevo);
        aplicarEfectos(pedido, nuevo, Instant.now(clock));
        registrarHistorial(pedido, nuevo, usuarioId, comentario);
        return pedido;
    }

    @Override
    public Pedido devolverAlMostrador(Long pedidoId, Long usuarioId, String comentario) {
        Pedido pedido = pedidoBloqueado(pedidoId);
        if (pedido.getEstado() != EstadoPedido.EN_CAMINO || pedido.getTipoEntrega() != TipoEntrega.DELIVERY) {
            throw new ReglaNegocioException("TRANSICION_INVALIDA", "Solo un delivery en camino puede volver al mostrador");
        }
        pedido.setEstado(EstadoPedido.LISTO);
        registrarHistorial(pedido, EstadoPedido.LISTO, usuarioId, comentario);
        return pedido;
    }

    @Override
    public Pedido cancelar(Long pedidoId, Long usuarioId, String motivo) {
        Pedido pedido = pedidoBloqueado(pedidoId);
        PedidoEstadoPolicy.validar(pedido.getEstado(), EstadoPedido.CANCELADO, pedido.getTipoEntrega());
        pedido.setEstado(EstadoPedido.CANCELADO);
        pedido.setCanceladoEn(Instant.now(clock));
        pedido.setMotivoCancelacion(motivo);
        registrarHistorial(pedido, EstadoPedido.CANCELADO, usuarioId, motivo);
        inventarioService.reponerStockWeb(pedido);
        return pedido;
    }

    @Override
    public PedidoResponse cambiarEstado(Long pedidoId, Long usuarioId, CambiarEstadoPedidoRequest request) {
        EstadoPedido nuevo = request.estado();
        Pedido actual = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido", pedidoId));
        if (nuevo == EstadoPedido.CANCELADO) {
            throw new ReglaNegocioException("USAR_CANCELACION",
                    "Para cancelar usa la cancelación del pedido, que también gestiona el reembolso");
        }
        if (nuevo == EstadoPedido.EN_CAMINO) {
            throw new ReglaNegocioException("ASIGNACION_REQUERIDA", "El pedido sale a reparto al asignar un motorizado");
        }
        if (nuevo == EstadoPedido.ENTREGADO && actual.getTipoEntrega() == TipoEntrega.DELIVERY) {
            throw new ReglaNegocioException("PIN_REQUERIDO", "La entrega a domicilio se confirma con el PIN del cliente");
        }
        return pedidoAssembler.respuesta(avanzar(pedidoId, nuevo, usuarioId, request.comentario()));
    }

    @Override
    public int marcarNoRecogidos() {
        List<Pedido> vencidos = pedidoRepository.findByEstadoAndTipoEntregaAndVencimientoRecojoBefore(
                EstadoPedido.LISTO, TipoEntrega.RECOJO, Instant.now(clock));
        vencidos.forEach(p -> avanzar(p.getId(), EstadoPedido.NO_RECOGIDO, null, "Venció el plazo de recojo"));
        return vencidos.size();
    }

    @Override
    public int expirarPendientesDePago() {
        int minutos = parametros.entero(ParametroClaves.MINUTOS_EXPIRACION_PAGO,
                ParametroClaves.MINUTOS_EXPIRACION_PAGO_DEFECTO);
        Instant limite = Instant.now(clock).minus(Duration.ofMinutes(minutos));
        List<Pedido> vencidos = pedidoRepository.findPendientesDePagoSinCobroEnCurso(
                EstadoPedido.PENDIENTE_PAGO, EstadoPago.PENDIENTE, limite);
        vencidos.forEach(p -> cancelar(p.getId(), null, "Pago no completado a tiempo"));
        return vencidos.size();
    }

    private void aplicarEfectos(Pedido pedido, EstadoPedido nuevo, Instant ahora) {
        switch (nuevo) {
            case CONFIRMADO -> {
                pedido.setConfirmadoEn(ahora);
                notificacionService.notificarRolEnSucursal(Rol.PIZZERO, pedido.getSucursal().getId(),
                        TipoNotificacion.PEDIDO_NUEVO, "Pedido nuevo " + pedido.getNumero(),
                        pedido.getTipoEntrega().getEtiqueta() + " en " + pedido.getSucursal().getNombre() + ".");
            }
            case LISTO -> marcarListo(pedido, ahora);
            case ENTREGADO -> {
                pedido.setEntregadoEn(ahora);
                pedido.setGarantiaAplicada(llegoTarde(pedido, ahora));
            }
            default -> { }
        }
    }

    private void marcarListo(Pedido pedido, Instant ahora) {
        pedido.setListoEn(ahora);
        if (pedido.getTipoEntrega() == TipoEntrega.RECOJO) {
            int minutos = parametros.entero(ParametroClaves.MINUTOS_VENCIMIENTO_RECOJO,
                    ParametroClaves.MINUTOS_VENCIMIENTO_RECOJO_DEFECTO);
            pedido.setVencimientoRecojo(ahora.plus(Duration.ofMinutes(minutos)));
            notificacionService.notificarUsuario(pedido.getCliente().getId(), TipoNotificacion.PEDIDO_LISTO,
                    "Tu pedido está listo",
                    "Pasa a recoger el pedido " + pedido.getNumero() + " en " + minutos + " minutos como máximo.");
        } else {
            crearEntrega(pedido);
        }
        notificacionService.notificarRolEnSucursal(Rol.DESPACHADOR, pedido.getSucursal().getId(),
                TipoNotificacion.PEDIDO_LISTO, "Pedido listo " + pedido.getNumero(),
                pedido.getTipoEntrega().getEtiqueta() + " en " + pedido.getSucursal().getNombre() + ".");
    }

    private void crearEntrega(Pedido pedido) {
        Entrega entrega = new Entrega();
        entrega.setPedido(pedido);
        entrega.setEstado(EstadoEntrega.SIN_ASIGNAR);
        entrega.setCodigoPin(CodigoEntregaGenerator.generar());
        Direccion origen = pedido.getSucursal().getDireccion();
        Direccion destino = pedido.getDireccionEntrega();
        if (origen != null && destino != null) {
            entrega.setDistanciaKm(CalculadoraDistancia.kilometros(
                    origen.getLatitud(), origen.getLongitud(), destino.getLatitud(), destino.getLongitud()));
        }
        entregaRepository.save(entrega);
    }

    private boolean llegoTarde(Pedido pedido, Instant entregadoEn) {
        if (pedido.getTipoEntrega() != TipoEntrega.DELIVERY || pedido.getConfirmadoEn() == null
                || pedido.getMinutosEstimados() == null) {
            return false;
        }
        int tolerancia = parametros.entero(ParametroClaves.MINUTOS_TOLERANCIA_GARANTIA,
                ParametroClaves.MINUTOS_TOLERANCIA_GARANTIA_DEFECTO);
        Instant limite = pedido.getConfirmadoEn().plus(Duration.ofMinutes(pedido.getMinutosEstimados() + tolerancia));
        return entregadoEn.isAfter(limite);
    }

    private void registrarHistorial(Pedido pedido, EstadoPedido estado, Long usuarioId, String comentario) {
        PedidoEstadoHistorial historial = new PedidoEstadoHistorial();
        historial.setPedido(pedido);
        historial.setEstado(estado);
        historial.setCambiadoPor(usuarioId == null ? null : usuarioRepository.getReferenceById(usuarioId));
        historial.setComentario(comentario);
        historialRepository.save(historial);
    }

    private Pedido pedidoBloqueado(Long id) {
        return pedidoRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido", id));
    }
}
