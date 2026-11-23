package com.totospizza.dto.response.pedido;

import java.time.Instant;

import com.totospizza.model.enums.EstadoPedido;

/**
 * Cambio de estado de un pedido.
 */
public record HistorialEstadoResponse(
        EstadoPedido estado,
        String comentario,
        Instant fecha
) {
}
