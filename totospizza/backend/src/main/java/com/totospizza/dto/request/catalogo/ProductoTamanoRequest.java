package com.totospizza.dto.request.catalogo;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Precio de un producto para un tamaño.
 */
public record ProductoTamanoRequest(
        @NotNull @Positive Long tamanoId,
        @NotNull @DecimalMin(value = "0.00") @Digits(integer = 8, fraction = 2) BigDecimal precio
) {
}
