package com.totospizza.dto.response.resena;

import java.math.BigDecimal;

/**
 * Promedio y total de reseñas.
 */
public record ResumenCalificacionResponse(
        BigDecimal promedio,
        long total
) {
}
