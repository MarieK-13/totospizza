package com.totospizza.service.impl.operacion;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Clock;
import java.time.Instant;
import java.util.EnumSet;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.request.operacion.ConfirmarEntregaRequest;
import com.totospizza.dto.response.operacion.EntregaAsignadaResponse;
import com.totospizza.dto.response.operacion.EntregaResponse;
import com.totospizza.exception.RecursoNoEncontradoException;
import com.totospizza.exception.ReglaNegocioException;
import com.totospizza.mapper.operacion.EntregaMapper;
import com.totospizza.model.entity.operacion.Entrega;
import com.totospizza.model.entity.seguridad.Empleado;
import com.totospizza.model.enums.EstadoEntrega;
import com.totospizza.model.enums.EstadoPedido;
import com.totospizza.repository.operacion.EntregaRepository;
import com.totospizza.service.operacion.RepartoService;
import com.totospizza.service.pedido.PedidoEstadoService;

@Service
@RequiredArgsConstructor
@Transactional
public class RepartoServiceImpl implements RepartoService {

    private static final int MAX_INTENTOS_PIN = 5;

    private final EntregaRepository entregaRepository;
    private final PedidoEstadoService pedidoEstadoService;
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
    public EntregaResponse iniciarRuta(Long usuarioId, Long entregaId) {
        Entrega entrega = entregaBloqueada(usuarioId, entregaId);
        if (entrega.getEstado() != EstadoEntrega.ASIGNADA) {
            throw new ReglaNegocioException("ENTREGA_NO_ASIGNADA", "Esta entrega no está lista para salir");
        }
        entrega.setEstado(EstadoEntrega.EN_CAMINO);
        entrega.setRecogidaEn(Instant.now(clock));
        pedidoEstadoService.avanzar(entrega.getPedido().getId(), EstadoPedido.EN_CAMINO, usuarioId, "Salió a reparto");
        return entregaMapper.toResponse(entrega);
    }

    @Override
    @Transactional(noRollbackFor = ReglaNegocioException.class)
    public EntregaResponse confirmarEntrega(Long usuarioId, Long entregaId, ConfirmarEntregaRequest request) {
        Entrega entrega = entregaBloqueada(usuarioId, entregaId);
        if (entrega.getEstado() != EstadoEntrega.EN_CAMINO) {
            throw new ReglaNegocioException("ENTREGA_NO_EN_CAMINO", "La entrega no está en camino");
        }
        if (entrega.getIntentosFallidos() >= MAX_INTENTOS_PIN) {
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

    /** La entrega debe ser del motorizado que la pide; para otro usuario "no existe". */
    private Entrega entregaBloqueada(Long usuarioId, Long entregaId) {
        Empleado motorizado = personalActual.de(usuarioId);
        Long pedidoId = entregaRepository.findById(entregaId)
                .filter(e -> e.getMotorizado() != null && e.getMotorizado().getId().equals(motorizado.getId()))
                .orElseThrow(() -> new RecursoNoEncontradoException("Entrega", entregaId))
                .getPedido().getId();
        return entregaRepository.findByPedidoIdForUpdate(pedidoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Entrega", entregaId));
    }

    private static boolean coincide(String esperado, String recibido) {
        return esperado != null && recibido != null
                && MessageDigest.isEqual(esperado.getBytes(StandardCharsets.UTF_8), recibido.getBytes(StandardCharsets.UTF_8));
    }
}
