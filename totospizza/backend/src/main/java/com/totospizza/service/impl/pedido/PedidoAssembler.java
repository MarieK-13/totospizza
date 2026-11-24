package com.totospizza.service.impl.pedido;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.response.pago.PagoResponse;
import com.totospizza.dto.response.pedido.PedidoResponse;
import com.totospizza.mapper.pago.PagoMapper;
import com.totospizza.mapper.pedido.PedidoMapper;
import com.totospizza.model.entity.pedido.Pedido;
import com.totospizza.repository.pago.PagoRepository;
import com.totospizza.repository.pedido.PedidoEstadoHistorialRepository;

@Component
@RequiredArgsConstructor
class PedidoAssembler {

    private final PedidoMapper pedidoMapper;
    private final PagoMapper pagoMapper;
    private final PagoRepository pagoRepository;
    private final PedidoEstadoHistorialRepository historialRepository;

    PedidoResponse respuesta(Pedido pedido) {
        PagoResponse pago = pagoRepository.findByPedidoIdOrderByCreadoEnDesc(pedido.getId()).stream()
                .findFirst()
                .map(pagoMapper::toResponse)
                .orElse(null);
        return pedidoMapper.toResponse(pedido, pago, historialRepository.findByPedidoIdOrderByCreadoEnAsc(pedido.getId()));
    }
}
