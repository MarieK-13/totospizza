package com.totospizza.dto.response.pedido;

import java.math.BigDecimal;
import java.time.Instant;

import com.totospizza.model.enums.EstadoPedido;
import com.totospizza.model.enums.TipoEntrega;

/**
 * Fila del historial de pedidos.
 */
public record PedidoResumenResponse(
        Long id,
        String numero,
        TipoEntrega tipoEntrega,
        EstadoPedido estado,
        BigDecimal total,
        Integer cantidadItems,
        Instant creadoEn,
        String nombreCliente,
        String telefonoCliente
) {
}
