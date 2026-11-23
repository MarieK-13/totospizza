package com.totospizza.dto.response.finanzas;

import com.totospizza.model.enums.EstadoPedido;

/**
 * Pedidos agrupados por estado.
 */
public record PedidosPorEstadoResponse(
        EstadoPedido estado,
        long cantidad
) {
}
