package com.totospizza.dto.request.sucursal;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

/**
 * Consulta si una ubicación está dentro de la zona de reparto.
 */
public record ConsultaCoberturaRequest(
        @NotNull @DecimalMin(value = "-90.0") @DecimalMax(value = "90.0") BigDecimal latitud,
        @NotNull @DecimalMin(value = "-180.0") @DecimalMax(value = "180.0") BigDecimal longitud,
        Long sucursalId
) {
}
