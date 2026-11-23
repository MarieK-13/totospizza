package com.totospizza.dto.request.pago;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Reembolso total o parcial de un pago (administrador).
 */
public record ReembolsoRequest(
        @NotNull @DecimalMin(value = "0.00") @Digits(integer = 8, fraction = 2) BigDecimal monto,
        @NotBlank @Size(max = 250) String motivo
) {
}
