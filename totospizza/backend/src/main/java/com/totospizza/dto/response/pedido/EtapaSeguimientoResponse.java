package com.totospizza.dto.response.pedido;

import java.time.Instant;

/**
 * Etapa visible en el seguimiento.
 */
public record EtapaSeguimientoResponse(
        String nombre,
        boolean completada,
        boolean actual,
        Instant fecha
) {
}
