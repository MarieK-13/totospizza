package com.totospizza.dto.request.operacion;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import com.totospizza.model.enums.TipoMovimientoInventario;

/**
 * Movimiento manual de inventario de un ingrediente.
 */
public record AjusteInventarioRequest(
        @NotNull TipoMovimientoInventario tipo,
        @NotNull @DecimalMin(value = "0.01") @Digits(integer = 8, fraction = 2) BigDecimal cantidad,
        @NotBlank @Size(max = 250) String motivo
) {
}
