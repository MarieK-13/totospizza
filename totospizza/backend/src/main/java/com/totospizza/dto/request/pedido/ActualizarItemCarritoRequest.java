package com.totospizza.dto.request.pedido;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Modifica cantidad o notas de un ítem del carrito.
 */
public record ActualizarItemCarritoRequest(
        @NotNull @Min(1) @Max(20) Integer cantidad,
        @Size(max = 250) String notas
) {
}
