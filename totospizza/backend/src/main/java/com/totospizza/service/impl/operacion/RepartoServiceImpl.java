package com.totospizza.service.impl.operacion;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.request.operacion.ConfirmarEntregaRequest;
import com.totospizza.dto.response.operacion.EntregaAsignadaResponse;
import com.totospizza.dto.response.operacion.EntregaResponse;
import com.totospizza.dto.response.operacion.ResumenRepartoResponse;
import com.totospizza.exception.RecursoNoEncontradoException;
import com.totospizza.exception.ReglaNegocioException;
import com.totospizza.mapper.operacion.EntregaMapper;
import com.totospizza.model.entity.operacion.Entrega;
import com.totospizza.model.entity.seguridad.Empleado;
import com.totospizza.model.enums.EstadoEntrega;
import com.totospizza.model.enums.EstadoPedido;
import com.totospizza.repository.operacion.EntregaRepository;
import com.totospizza.rules.calculator.CalculadoraPagoMotorizado;
import com.totospizza.rules.policy.PinEntregaPolicy;
import com.totospizza.service.operacion.RepartoService;
import com.totospizza.service.pedido.PedidoEstadoService;
import com.totospizza.util.FechaUtil;
import com.totospizza.dto.request.operacion.MotivoRequest;
import com.totospizza.mapper.MapeoUtils;
import com.totospizza.model.entity.pedido.Pedido;
import com.totospizza.model.enums.Rol;
import com.totospizza.model.enums.TipoNotificacion;
import com.totospizza.service.operacion.NotificacionService;

@Service
@RequiredArgsConstructor
@Transactional
public class RepartoServiceImpl implements RepartoService {

    private final EntregaRepository entregaRepository;
    private final PedidoEstadoService pedidoEstadoService;
    private final NotificacionService notificacionService;
    private final EntregaMapper entregaMapper;
    private final PersonalActual personalActual;
    private final Clock clock;

    @Override
    @Transactional(readOnly = true)
    public List<EntregaAsignadaResponse> misEntregas(Long usuarioId) {
        Empleado motorizado = personalActual.de(usuarioId);
        return entregaRepository.findByMotorizadoIdAndEstadoInOrderByAsignadaEnAsc(
                        motorizado.getId(), EnumSet.of(EstadoEntrega.ASIGNADA, EstadoEntrega.EN_CAMINO)).stream()
                .map(entregaMapper::toAsignada)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ResumenRepartoResponse resumen(Long usuarioId) {
        Empleado motorizado = personalActual.de(usuarioId);
        List<Entrega> hoy = entregaRepository.findByMotorizadoIdAndEstadoAndEntregadaEnGreaterThanEqualOrderByEntregadaEnDesc(
                motorizado.getId(), EstadoEntrega.ENTREGADA, FechaUtil.inicioDelDia(FechaUtil.hoy(clock), clock));
        BigDecimal km = hoy.stream()
                .map(Entrega::getDistanciaKm)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(1, RoundingMode.HALF_UP);
        BigDecimal bonos = CalculadoraPagoMotorizado
                .calcular(null, motorizado.getBonoPorEntrega(), 0, hoy.size())
                .montoBonos();
        return new ResumenRepartoResponse(hoy.size(), km, motorizado.getBonoPorEntrega(), bonos,
                minutosPromedioEnRuta(hoy), hoy.stream().map(entregaMapper::toRealizada).toList());
    }

    @Override
    public EntregaResponse iniciarRuta(Long usuarioId, Long entregaId) {
        Entrega entrega = entregaBloqueada(usuarioId, entregaId);
        if (entrega.getEstado() != EstadoEntrega.ASIGNADA) {
            throw new ReglaNegocioException("ENTREGA_NO_ASIGNADA", "Esta entrega no está lista para salir");
        }
        entrega.setEstado(EstadoEntrega.EN_CAMINO);
        entrega.setRecogidaEn(Instant.now(clock));
        Pedido pedido = pedidoEstadoService.avanzar(entrega.getPedido().getId(), EstadoPedido.EN_CAMINO, usuarioId,
                "Salió a reparto");
        notificacionService.notificarUsuario(pedido.getCliente().getId(), TipoNotificacion.PEDIDO_EN_CAMINO,
                "Tu pedido va en camino",
                MapeoUtils.nombreMotorizado(entrega) + " salió con tu pedido " + pedido.getNumero()
                        + ". Para recibirlo, dale tu código de entrega de 4 dígitos: lo ves en el seguimiento.");
        return entregaMapper.toResponse(entrega);
    }

    @Override
    public EntregaResponse reportarFallida(Long usuarioId, Long entregaId, MotivoRequest request) {
        Entrega entrega = entregaBloqueada(usuarioId, entregaId);
        if (entrega.getEstado() != EstadoEntrega.EN_CAMINO) {
            throw new ReglaNegocioException("ENTREGA_NO_EN_CAMINO", "La entrega no está en camino");
        }
        String motivo = request.motivo().trim();
        entrega.setEstado(EstadoEntrega.FALLIDA);
        entrega.setMotivoFallo(motivo);
        entrega.setFallidaEn(Instant.now(clock));
        Pedido pedido = pedidoEstadoService.devolverAlMostrador(entrega.getPedido().getId(), usuarioId,
                "No se pudo entregar: " + motivo);
        notificacionService.notificarRolEnSucursal(Rol.DESPACHADOR, pedido.getSucursal().getId(),
                TipoNotificacion.ENTREGA_FALLIDA, "No se pudo entregar " + pedido.getNumero(),
                motivo + ". Reasígnalo o cancélalo desde el mostrador.");
        notificacionService.notificarUsuario(pedido.getCliente().getId(), TipoNotificacion.ENTREGA_FALLIDA,
                "No pudimos entregar tu pedido",
                "El motorizado no pudo entregar el pedido " + pedido.getNumero() + " (" + motivo
                        + "). La tienda se comunicará contigo para coordinar.");
        return entregaMapper.toResponse(entrega);
    }

    @Override
    @Transactional(noRollbackFor = ReglaNegocioException.class)
    public EntregaResponse confirmarEntrega(Long usuarioId, Long entregaId, ConfirmarEntregaRequest request) {
        Entrega entrega = entregaBloqueada(usuarioId, entregaId);
        if (entrega.getEstado() != EstadoEntrega.EN_CAMINO) {
            throw new ReglaNegocioException("ENTREGA_NO_EN_CAMINO", "La entrega no está en camino");
        }
        if (PinEntregaPolicy.bloqueado(entrega.getIntentosFallidos())) {
            throw new ReglaNegocioException("PIN_BLOQUEADO", "Demasiados intentos. Pide ayuda al despachador");
        }
        if (!coincide(entrega.getCodigoPin(), request.codigoPin())) {
            entrega.setIntentosFallidos(entrega.getIntentosFallidos() + 1);
            throw new ReglaNegocioException("PIN_INCORRECTO", "El PIN no coincide con el del cliente");
        }
        entrega.setEstado(EstadoEntrega.ENTREGADA);
        entrega.setEntregadaEn(Instant.now(clock));
        pedidoEstadoService.avanzar(entrega.getPedido().getId(), EstadoPedido.ENTREGADO, usuarioId, "Entregado con PIN");
        return entregaMapper.toResponse(entrega);
    }

    private Entrega entregaBloqueada(Long usuarioId, Long entregaId) {
        Empleado motorizado = personalActual.de(usuarioId);
        Long pedidoId = entregaRepository.findById(entregaId)
                .filter(e -> e.getMotorizado() != null && e.getMotorizado().getId().equals(motorizado.getId()))
                .orElseThrow(() -> new RecursoNoEncontradoException("Entrega", entregaId))
                .getPedido().getId();
        return entregaRepository.findByPedidoIdForUpdate(pedidoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Entrega", entregaId));
    }

    private static Integer minutosPromedioEnRuta(List<Entrega> entregas) {
        return entregas.stream()
                .filter(e -> e.getRecogidaEn() != null && e.getEntregadaEn() != null)
                .mapToLong(e -> Duration.between(e.getRecogidaEn(), e.getEntregadaEn()).toMinutes())
                .average()
                .stream()
                .mapToObj(promedio -> (int) Math.round(promedio))
                .findFirst()
                .orElse(null);
    }

    private static boolean coincide(String esperado, String recibido) {
        return esperado != null && recibido != null
                && MessageDigest.isEqual(esperado.getBytes(StandardCharsets.UTF_8), recibido.getBytes(StandardCharsets.UTF_8));
    }
}
