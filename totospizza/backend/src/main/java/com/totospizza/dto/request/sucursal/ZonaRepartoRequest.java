package com.totospizza.dto.request.sucursal;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Zona de reparto por rango de distancia.
 */
public record ZonaRepartoRequest(
        @NotBlank @Size(max = 60) String nombre,
        @NotNull @DecimalMin(value = "0.0") @Digits(integer = 2, fraction = 2) BigDecimal distanciaDesdeKm,
        @NotNull @DecimalMin(value = "0.0") @Digits(integer = 2, fraction = 2) BigDecimal distanciaHastaKm,
        @NotNull @DecimalMin(value = "0.00") @Digits(integer = 8, fraction = 2) BigDecimal costoEnvio,
        boolean activa
) {
}
