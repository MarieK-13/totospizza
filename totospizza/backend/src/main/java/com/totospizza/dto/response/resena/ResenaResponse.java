package com.totospizza.dto.response.resena;

import java.time.Instant;
import java.util.List;

/**
 * Reseña de un cliente.
 */
public record ResenaResponse(
        Long id,
        String autor,
        Integer calificacion,
        String comentario,
        Instant creadoEn,
        boolean destacada,
        boolean visible,
        List<CalificacionProductoResponse> calificaciones
) {
}
