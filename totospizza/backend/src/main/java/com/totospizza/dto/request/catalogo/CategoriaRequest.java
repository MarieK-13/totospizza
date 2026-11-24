package com.totospizza.dto.request.catalogo;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Datos para crear o editar una categoría del menú.
 */
public record CategoriaRequest(
        @NotBlank @Size(max = 60) String nombre,
        @Min(0) @Max(999) Integer orden,
        boolean activa
) {
}
