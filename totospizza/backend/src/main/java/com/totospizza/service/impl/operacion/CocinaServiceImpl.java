package com.totospizza.service.impl.operacion;

import java.time.Clock;
import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.response.operacion.TableroCocinaResponse;
import com.totospizza.dto.response.operacion.TicketCocinaResponse;
import com.totospizza.exception.RecursoNoEncontradoException;
import com.totospizza.mapper.operacion.CocinaMapper;
import com.totospizza.model.entity.pedido.Pedido;
import com.totospizza.model.entity.seguridad.Empleado;
import com.totospizza.model.enums.EstadoPedido;
import com.totospizza.repository.pedido.PedidoRepository;
import com.totospizza.rules.policy.PedidoEstadoPolicy;
import com.totospizza.service.operacion.CocinaService;
import com.totospizza.service.pedido.PedidoEstadoService;

@Service
@RequiredArgsConstructor
@Transactional
public class CocinaServiceImpl implements CocinaService {

    private final PedidoRepository pedidoRepository;
    private final PedidoEstadoService pedidoEstadoService;
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
        List<Pedido> pedidos = pedidoRepository.findBySucursalIdAndEstadoInOrderByConfirmadoEnAsc(
                pizzero.getSucursal().getId(), PedidoEstadoPolicy.ESTADOS_COCINA);
        List<TicketCocinaResponse> porPreparar = pedidos.stream()
                .filter(p -> p.getEstado() != EstadoPedido.EN_HORNO)
                .map(p -> cocinaMapper.toTicket(p, ahora))
                .toList();
        List<TicketCocinaResponse> enHorno = pedidos.stream()
                .filter(p -> p.getEstado() == EstadoPedido.EN_HORNO)
                .map(p -> cocinaMapper.toTicket(p, ahora))
                .toList();
        return new TableroCocinaResponse(porPreparar, enHorno);
    }
}
