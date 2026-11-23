package com.totospizza.service.impl.operacion;

import java.time.Clock;
import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.request.operacion.AsignarMotorizadoRequest;
import com.totospizza.dto.response.operacion.EntregaResponse;
import com.totospizza.dto.response.operacion.PedidoListoResponse;
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
import com.totospizza.service.operacion.DespachoService;
import com.totospizza.service.operacion.NotificacionService;
import com.totospizza.service.pedido.PedidoEstadoService;

@Service
@RequiredArgsConstructor
@Transactional
public class DespachoServiceImpl implements DespachoService {

    private static final Set<EstadoPedido> ESTADOS_MOSTRADOR = EnumSet.of(EstadoPedido.LISTO, EstadoPedido.EN_CAMINO);
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
        if (entrega.getEstado() != EstadoEntrega.SIN_ASIGNAR && entrega.getEstado() != EstadoEntrega.ASIGNADA) {
            throw new ReglaNegocioException("ENTREGA_EN_CURSO", "La entrega ya salió y no se puede reasignar");
        }
        Empleado motorizado = motorizadoValido(request.motorizadoId(), despachador);

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
