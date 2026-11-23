package com.totospizza.dto.request.sucursal;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import com.totospizza.dto.request.seguridad.DireccionRequest;

/**
 * Alta o edición de una sucursal.
 */
public record SucursalRequest(
        @NotBlank @Size(max = 100) String nombre,
        @NotNull @Valid DireccionRequest direccion,
        @NotBlank
        @Pattern(regexp = "^9\\d{8}$", message = "El celular debe tener 9 dígitos y empezar con 9")
        String telefono,
        @Size(max = 500) String imagenUrl,
        boolean activa,
        @NotNull
        @DecimalMin(value = "0.5")
        @DecimalMax(value = "10.0")
        @Digits(integer = 2, fraction = 1)
        BigDecimal radioCoberturaKm,
        @NotNull @Valid @Size(max = 7) List<HorarioSucursalRequest> horarios,
        @NotNull @Valid @Size(max = 10) List<ZonaRepartoRequest> zonas
) {
}
