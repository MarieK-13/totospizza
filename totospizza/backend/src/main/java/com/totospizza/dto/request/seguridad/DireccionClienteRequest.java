package com.totospizza.dto.request.seguridad;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Dirección guardada en la libreta del cliente.
 */
public record DireccionClienteRequest(
        @NotBlank @Size(max = 40) String etiqueta,
        @NotNull @Valid DireccionRequest direccion,
        boolean favorita
) {
}
