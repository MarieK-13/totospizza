package com.totospizza.service.impl.operacion;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import com.totospizza.config.ClockConfig;
import com.totospizza.constant.ParametroClaves;
import com.totospizza.dto.response.operacion.TableroCocinaResponse;
import com.totospizza.dto.response.operacion.TicketCocinaResponse;
import com.totospizza.exception.RecursoNoEncontradoException;
import com.totospizza.mapper.operacion.CocinaMapper;
import com.totospizza.model.entity.pedido.Pedido;
import com.totospizza.model.entity.pedido.PedidoEstadoHistorial;
import com.totospizza.model.entity.seguridad.Empleado;
import com.totospizza.model.enums.EstadoPedido;
import com.totospizza.repository.pedido.PedidoEstadoHistorialRepository;
import com.totospizza.repository.pedido.PedidoRepository;
import com.totospizza.rules.policy.PedidoEstadoPolicy;
import com.totospizza.service.configuracion.ParametrosService;
import com.totospizza.service.operacion.CocinaService;
import com.totospizza.service.pedido.PedidoEstadoService;

@Service
@RequiredArgsConstructor
@Transactional
public class CocinaServiceImpl implements CocinaService {

    private final PedidoRepository pedidoRepository;
    private final PedidoEstadoHistorialRepository historialRepository;
    private final PedidoEstadoService pedidoEstadoService;
    private final ParametrosService parametros;
    private final CocinaMapper cocinaMapper;
    private final PersonalActual personalActual;
    private final Clock clock;

    @Override
    @Transactional(readOnly = true)
    public TableroCocinaResponse tablero(Long usuarioId) {
        return armarTablero(personalActual.de(usuarioId));
    }

    @Override
    public TableroCocinaResponse iniciarPreparacion(Long usuarioId, Long pedidoId) {
        return mover(usuarioId, pedidoId, EstadoPedido.EN_PREPARACION);
    }

    @Override
    public TableroCocinaResponse enviarAlHorno(Long usuarioId, Long pedidoId) {
        return mover(usuarioId, pedidoId, EstadoPedido.EN_HORNO);
    }

    @Override
    public TableroCocinaResponse marcarListo(Long usuarioId, Long pedidoId) {
        return mover(usuarioId, pedidoId, EstadoPedido.LISTO);
    }

    private TableroCocinaResponse mover(Long usuarioId, Long pedidoId, EstadoPedido nuevo) {
        Empleado pizzero = personalActual.de(usuarioId);
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido", pedidoId));
        personalActual.exigirMismaSucursal(pizzero, pedido);
        pedidoEstadoService.avanzar(pedidoId, nuevo, usuarioId, null);
        return armarTablero(pizzero);
    }

    private TableroCocinaResponse armarTablero(Empleado pizzero) {
        Instant ahora = Instant.now(clock);
        Long sucursalId = pizzero.getSucursal().getId();

        List<Pedido> enCocina = pedidoRepository.findBySucursalIdAndEstadoInOrderByConfirmadoEnAsc(
                sucursalId, PedidoEstadoPolicy.ESTADOS_COCINA);
        List<Pedido> listos = pedidoRepository.findTop20BySucursalIdAndEstadoOrderByListoEnDesc(
                sucursalId, EstadoPedido.LISTO);
        Map<Long, Instant> desde = entradaAlEstadoActual(enCocina);

        List<TicketCocinaResponse> porPreparar = enCocina.stream()
                .filter(p -> p.getEstado() != EstadoPedido.EN_HORNO)
                .map(p -> cocinaMapper.toTicket(p, ahora, desde.getOrDefault(p.getId(), p.getConfirmadoEn())))
                .toList();
        List<TicketCocinaResponse> enHorno = enCocina.stream()
                .filter(p -> p.getEstado() == EstadoPedido.EN_HORNO)
                .map(p -> cocinaMapper.toTicket(p, ahora, desde.getOrDefault(p.getId(), p.getConfirmadoEn())))
                .toList();
        List<TicketCocinaResponse> ticketsListos = listos.stream()
                .map(p -> cocinaMapper.toTicket(p, ahora, p.getListoEn()))
                .toList();

        Instant inicioDelDia = LocalDate.now(clock.withZone(ClockConfig.ZONA_NEGOCIO))
                .atStartOfDay(ClockConfig.ZONA_NEGOCIO).toInstant();
        long preparadosHoy = pedidoRepository.countBySucursalIdAndListoEnGreaterThanEqual(sucursalId, inicioDelDia);
        int minutosObjetivo = parametros.entero(ParametroClaves.MINUTOS_PREPARACION,
                ParametroClaves.MINUTOS_PREPARACION_DEFECTO);

        return new TableroCocinaResponse(porPreparar, enHorno, ticketsListos, preparadosHoy, minutosObjetivo);
    }

    /** Cuándo entró cada pedido a su estado actual, según su historial (el último cambio a ese estado). */
    private Map<Long, Instant> entradaAlEstadoActual(List<Pedido> pedidos) {
        Map<Long, EstadoPedido> estados = new HashMap<>();
        pedidos.forEach(p -> estados.put(p.getId(), p.getEstado()));
        Map<Long, Instant> desde = new HashMap<>();
        if (estados.isEmpty()) {
            return desde;
        }
        for (PedidoEstadoHistorial cambio : historialRepository.findByPedidoIdInOrderByCreadoEnAsc(estados.keySet())) {
            Long pedidoId = cambio.getPedido().getId();
            if (cambio.getEstado() == estados.get(pedidoId)) {
                desde.put(pedidoId, cambio.getCreadoEn());
            }
        }
        return desde;
    }
}
