package com.totospizza.dto.request.catalogo;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import com.totospizza.model.enums.TipoIngrediente;

/**
 * Alta o edición de un ingrediente.
 */
public record IngredienteRequest(
        @NotBlank @Size(max = 80) String nombre,
        @NotNull TipoIngrediente tipo,
        @NotNull @DecimalMin(value = "0.00") @Digits(integer = 8, fraction = 2) BigDecimal precioExtra,
        @DecimalMin(value = "0.00") @Digits(integer = 8, fraction = 2) BigDecimal costoOperativoFijo,
        boolean disponible
) {
}
