package com.totospizza.dto.request.seguridad;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Dirección con coordenadas, reutilizada por checkout, sucursales y libreta del cliente.
 */
public record DireccionRequest(
        @NotBlank @Size(max = 200) String direccion,
        @Size(max = 200) String referencia,
        @NotBlank @Size(max = 80) String distrito,
        @NotNull @DecimalMin(value = "-90.0") @DecimalMax(value = "90.0") BigDecimal latitud,
        @NotNull @DecimalMin(value = "-180.0") @DecimalMax(value = "180.0") BigDecimal longitud
) {
}
