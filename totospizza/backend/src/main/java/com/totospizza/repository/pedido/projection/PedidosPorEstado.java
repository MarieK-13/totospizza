package com.totospizza.repository.pedido.projection;

import com.totospizza.model.enums.EstadoPedido;

/**
 * Cantidad de pedidos por estado en un periodo.
 */
public interface PedidosPorEstado {

    EstadoPedido getEstado();
    Long getCantidad();
}
