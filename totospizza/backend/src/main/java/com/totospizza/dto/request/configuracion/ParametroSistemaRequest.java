package com.totospizza.dto.request.configuracion;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Nuevo valor de un parámetro del sistema 
 */
public record ParametroSistemaRequest(
        @NotBlank @Size(max = 250) String valor
) {
}
