package com.totospizza.service.impl.operacion;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.request.operacion.AsignarMotorizadoRequest;
import com.totospizza.dto.response.operacion.EntregaResponse;
import com.totospizza.config.ClockConfig;
import com.totospizza.dto.response.operacion.PedidoListoResponse;
import com.totospizza.dto.response.operacion.ResumenDespachoResponse;
import com.totospizza.dto.response.seguridad.EmpleadoResponse;
import com.totospizza.exception.RecursoNoEncontradoException;
import com.totospizza.exception.ReglaNegocioException;
import com.totospizza.mapper.operacion.CocinaMapper;
import com.totospizza.mapper.operacion.EntregaMapper;
import com.totospizza.mapper.seguridad.EmpleadoMapper;
import com.totospizza.model.entity.operacion.Entrega;
import com.totospizza.model.entity.pedido.Pedido;
import com.totospizza.model.entity.seguridad.Empleado;
import com.totospizza.model.enums.EstadoEmpleado;
import com.totospizza.model.enums.EstadoEntrega;
import com.totospizza.model.enums.EstadoPedido;
import com.totospizza.model.enums.Rol;
import com.totospizza.model.enums.TipoNotificacion;
import com.totospizza.repository.operacion.EntregaRepository;
import com.totospizza.repository.pedido.PedidoRepository;
import com.totospizza.repository.seguridad.EmpleadoRepository;
import com.totospizza.rules.policy.PedidoEstadoPolicy;
import com.totospizza.service.operacion.DespachoService;
import com.totospizza.service.operacion.NotificacionService;
import com.totospizza.service.pedido.PedidoEstadoService;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.support.TransactionTemplate;
import com.totospizza.dto.request.operacion.MotivoRequest;
import com.totospizza.dto.request.pedido.CancelarPedidoRequest;
import com.totospizza.rules.policy.PinEntregaPolicy;
import com.totospizza.service.pedido.PedidoService;

@Service
@RequiredArgsConstructor
@Transactional
public class DespachoServiceImpl implements DespachoService {

    private static final Set<EstadoPedido> ESTADOS_MOSTRADOR = EnumSet.of(EstadoPedido.LISTO, EstadoPedido.EN_CAMINO);
    private static final Set<EstadoEntrega> ESTADOS_ASIGNABLES =
            EnumSet.of(EstadoEntrega.SIN_ASIGNAR, EstadoEntrega.ASIGNADA, EstadoEntrega.FALLIDA);
    private static final Set<EstadoEmpleado> ESTADOS_SIN_SERVICIO = EnumSet.of(EstadoEmpleado.INACTIVO, EstadoEmpleado.CON_LICENCIA);

    private final PedidoRepository pedidoRepository;
    private final EntregaRepository entregaRepository;
    private final EmpleadoRepository empleadoRepository;
    private final PedidoEstadoService pedidoEstadoService;
    private final NotificacionService notificacionService;
    private final CocinaMapper cocinaMapper;
    private final EntregaMapper entregaMapper;
    private final EmpleadoMapper empleadoMapper;
    private final PersonalActual personalActual;
    private final PedidoService pedidoService;
    private final TransactionTemplate transaccion;
    private final Clock clock;

    @Override
    @Transactional(readOnly = true)
    public List<PedidoListoResponse> pedidosListos(Long usuarioId) {
        Empleado despachador = personalActual.de(usuarioId);
        return pedidoRepository.findBySucursalIdAndEstadoInOrderByConfirmadoEnAsc(
                        despachador.getSucursal().getId(), ESTADOS_MOSTRADOR).stream()
                .map(pedido -> cocinaMapper.toListo(pedido, entregaRepository.findByPedidoId(pedido.getId()).orElse(null)))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ResumenDespachoResponse resumen(Long usuarioId) {
        Long sucursalId = personalActual.de(usuarioId).getSucursal().getId();
        Instant inicioDelDia = LocalDate.now(clock.withZone(ClockConfig.ZONA_NEGOCIO))
                .atStartOfDay(ClockConfig.ZONA_NEGOCIO).toInstant();
        long enCocina = pedidoRepository.countBySucursalIdAndEstadoIn(sucursalId, PedidoEstadoPolicy.ESTADOS_COCINA);
        long entregadosHoy = pedidoRepository.countBySucursalIdAndEstadoAndEntregadoEnGreaterThanEqual(
                sucursalId, EstadoPedido.ENTREGADO, inicioDelDia);
        long motorizados = motorizadosDisponibles(usuarioId).size();
        return new ResumenDespachoResponse(enCocina, entregadosHoy, motorizados);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmpleadoResponse> motorizadosDisponibles(Long usuarioId) {
        Long sucursalId = personalActual.de(usuarioId).getSucursal().getId();
        return List.of(EstadoEmpleado.DISPONIBLE, EstadoEmpleado.EN_TURNO, EstadoEmpleado.ACTIVO).stream()
                .flatMap(estado -> empleadoRepository.findDisponibles(sucursalId, Rol.MOTORIZADO, estado).stream())
                .map(empleadoMapper::toResponse)
                .toList();
    }

    @Override
    public EntregaResponse asignarMotorizado(Long usuarioId, Long pedidoId, AsignarMotorizadoRequest request) {
        Empleado despachador = personalActual.de(usuarioId);
        Pedido pedido = pedido(pedidoId);
        personalActual.exigirMismaSucursal(despachador, pedido);

        Entrega entrega = entregaRepository.findByPedidoIdForUpdate(pedidoId)
                .orElseThrow(() -> new ReglaNegocioException("SIN_ENTREGA",
                        "El pedido no es de delivery o todavía no está listo"));
        if (!ESTADOS_ASIGNABLES.contains(entrega.getEstado())) {
            throw new ReglaNegocioException("ENTREGA_EN_CURSO", "La entrega ya salió y no se puede reasignar");
        }
        Empleado motorizado = motorizadoValido(request.motorizadoId(), despachador);
        if (entrega.getEstado() == EstadoEntrega.FALLIDA) {
            // Nuevo intento: el PIN vuelve a tener todos sus intentos.
            entrega.setIntentosFallidos(0);
            entrega.setRecogidaEn(null);
        }

        entrega.setMotorizado(motorizado);
        entrega.setEstado(EstadoEntrega.ASIGNADA);
        entrega.setAsignadaEn(Instant.now(clock));
        notificacionService.notificarUsuario(motorizado.getUsuario().getId(), TipoNotificacion.ENTREGA_ASIGNADA,
                "Nueva entrega", "Se te asignó el pedido " + pedido.getNumero() + ".");
        return entregaMapper.toResponse(entrega);
    }

    @Override
    public PedidoListoResponse entregarEnMostrador(Long usuarioId, Long pedidoId) {
        Empleado despachador = personalActual.de(usuarioId);
        personalActual.exigirMismaSucursal(despachador, pedido(pedidoId));
        Pedido pedido = pedidoEstadoService.avanzar(pedidoId, EstadoPedido.ENTREGADO, usuarioId, "Entregado en mostrador");
        return cocinaMapper.toListo(pedido, null);
    }

    @Override
    public PedidoListoResponse desbloquearPin(Long usuarioId, Long pedidoId) {
        Entrega entrega = entregaConPinBloqueado(usuarioId, pedidoId);
        entrega.setIntentosFallidos(0);
        notificacionService.notificarUsuario(entrega.getMotorizado().getUsuario().getId(), TipoNotificacion.SISTEMA,
                "PIN desbloqueado", "Ya puedes volver a ingresar el código del pedido " + entrega.getPedido().getNumero() + ".");
        return cocinaMapper.toListo(entrega.getPedido(), entrega);
    }

    @Override
    public PedidoListoResponse confirmarSinPin(Long usuarioId, Long pedidoId, MotivoRequest request) {
        Entrega entrega = entregaConPinBloqueado(usuarioId, pedidoId);
        entrega.setEstado(EstadoEntrega.ENTREGADA);
        entrega.setEntregadaEn(Instant.now(clock));
        Pedido pedido = pedidoEstadoService.avanzar(pedidoId, EstadoPedido.ENTREGADO, usuarioId,
                "Entregado sin PIN, confirmado por el despachador: " + request.motivo().trim());
        return cocinaMapper.toListo(pedido, entrega);
    }

    @Override
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public PedidoListoResponse cancelarEntregaFallida(Long usuarioId, Long pedidoId, CancelarPedidoRequest request) {
        transaccion.executeWithoutResult(estado -> {
            if (entregaDeMiSucursal(usuarioId, pedidoId).getEstado() != EstadoEntrega.FALLIDA) {
                throw new ReglaNegocioException("ENTREGA_NO_FALLIDA",
                        "Solo se cancela desde el mostrador un delivery que no se pudo entregar");
            }
        });
        pedidoService.cancelarAdmin(usuarioId, pedidoId, request);
        return transaccion.execute(estado -> cocinaMapper.toListo(pedido(pedidoId),
                entregaRepository.findByPedidoId(pedidoId).orElse(null)));
    }

    private Entrega entregaConPinBloqueado(Long usuarioId, Long pedidoId) {
        Entrega entrega = entregaDeMiSucursal(usuarioId, pedidoId);
        if (entrega.getEstado() != EstadoEntrega.EN_CAMINO || !PinEntregaPolicy.bloqueado(entrega.getIntentosFallidos())) {
            throw new ReglaNegocioException("PIN_NO_BLOQUEADO", "Esta entrega no tiene el PIN bloqueado");
        }
        return entrega;
    }

    private Entrega entregaDeMiSucursal(Long usuarioId, Long pedidoId) {
        personalActual.exigirMismaSucursal(personalActual.de(usuarioId), pedido(pedidoId));
        return entregaRepository.findByPedidoIdForUpdate(pedidoId)
                .orElseThrow(() -> new ReglaNegocioException("SIN_ENTREGA", "El pedido no es de delivery"));
    }

    private Empleado motorizadoValido(Long motorizadoId, Empleado despachador) {
        Empleado motorizado = empleadoRepository.findById(motorizadoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Motorizado", motorizadoId));
        boolean valido = motorizado.getUsuario().getRol() == Rol.MOTORIZADO
                && motorizado.getUsuario().isActivo()
                && motorizado.getSucursal().getId().equals(despachador.getSucursal().getId())
                && !ESTADOS_SIN_SERVICIO.contains(motorizado.getEstado());
        if (!valido) {
            throw new ReglaNegocioException("MOTORIZADO_NO_DISPONIBLE", "Ese motorizado no está disponible en esta sucursal");
        }
        return motorizado;
    }

    private Pedido pedido(Long id) {
        return pedidoRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Pedido", id));
    }
}
