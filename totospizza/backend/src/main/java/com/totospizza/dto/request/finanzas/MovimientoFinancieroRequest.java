package com.totospizza.dto.request.finanzas;

import java.math.BigDecimal;
import java.time.Instant;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import com.totospizza.model.enums.TipoMovimientoFinanciero;

/**
 * Registro manual de un ingreso o egreso.
 */
public record MovimientoFinancieroRequest(
        @NotNull @Positive Long sucursalId,
        @NotNull TipoMovimientoFinanciero tipo,
        @NotBlank @Size(max = 200) String concepto,
        @NotNull @DecimalMin(value = "0.00") @Digits(integer = 8, fraction = 2) BigDecimal monto,
        @NotNull Instant ocurridoEn
) {
}
