package com.totospizza.dto.request.catalogo;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * Alta o edición de un producto del catálogo.
 */
public record ProductoRequest(
        @NotNull @Positive Long categoriaId,
        @NotBlank @Size(max = 120) String nombre,
        @Size(max = 1000) String descripcion,
        @Size(max = 500) String imagenUrl,
        @NotNull @DecimalMin(value = "0.00") @Digits(integer = 8, fraction = 2) BigDecimal precioBase,
        boolean requiereTamano,
        boolean disponible,
        boolean destacado,
        @NotNull @Size(max = 10) Set<Long> etiquetaIds,
        @NotNull @Valid @Size(max = 10) List<ProductoTamanoRequest> precios,
        @Size(max = 30) Set<Long> ingredienteIds
) {
}
