package com.totospizza.dto.request.resena;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Calificación de un producto dentro de una reseña.
 */
public record CalificacionProductoRequest(
        @NotNull @Positive Long productoId,
        @NotNull @Min(1) @Max(5) Integer estrellas
) {
}
