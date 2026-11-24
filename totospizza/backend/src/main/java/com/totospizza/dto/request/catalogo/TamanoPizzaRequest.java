package com.totospizza.dto.request.catalogo;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Datos de un tamaño de pizza.
 */
public record TamanoPizzaRequest(
        @NotBlank @Size(max = 40) String nombre,
        @NotNull @Min(10) @Max(80) Integer diametroCm,
        @NotNull @Min(1) @Max(20) Integer personasMin,
        @NotNull @Min(1) @Max(30) Integer personasMax,
        @NotNull @DecimalMin(value = "0.00") @Digits(integer = 8, fraction = 2) BigDecimal precioBase,
        @Min(0) @Max(999) Integer orden,
        boolean activo
) {
}
