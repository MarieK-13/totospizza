package com.totospizza.dto.response.pedido;

import java.math.BigDecimal;

import com.totospizza.model.enums.EstadoPago;
import com.totospizza.model.enums.EstadoPedido;

/**
 * Resultado de confirmar el pedido.
 */
public record CheckoutResponse(
        Long pedidoId,
        String numero,
        EstadoPedido estado,
        EstadoPago estadoPago,
        BigDecimal total,
        Integer minutosEstimados
) {
}
