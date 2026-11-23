package com.totospizza.dto.request.catalogo;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Producto incluido en una promoción.
 */
public record PromocionItemRequest(
        @NotNull @Positive Long productoId,
        Long tamanoId,
        @NotNull @Min(1) @Max(20) Integer cantidad
) {
}
