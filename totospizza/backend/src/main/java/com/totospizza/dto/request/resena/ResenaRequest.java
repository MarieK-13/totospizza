package com.totospizza.dto.request.resena;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * Reseña de un pedido entregado.
 */
public record ResenaRequest(
        @NotNull @Positive Long pedidoId,
        @NotNull @Min(1) @Max(5) Integer calificacion,
        @Size(max = 500) String comentario,
        @Valid @Size(max = 20) List<CalificacionProductoRequest> calificaciones
) {
}
