package com.totospizza.dto.request.pedido;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Ingrediente adicional agregado a un ítem.
 */
public record AdicionalRequest(
        @NotNull @Positive Long ingredienteId,
        @NotNull @Min(1) @Max(5) Integer cantidad
) {
}
