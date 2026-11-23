package com.totospizza.dto.response.catalogo;

import java.math.BigDecimal;

import com.totospizza.model.enums.TipoIngrediente;

/**
 * Ingrediente disponible para personalizar o agregar.
 */
public record IngredienteResponse(
        Long id,
        String nombre,
        TipoIngrediente tipo,
        BigDecimal precioExtra,
        boolean disponible
) {
}
