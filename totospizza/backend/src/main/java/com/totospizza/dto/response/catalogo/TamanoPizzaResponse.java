package com.totospizza.dto.response.catalogo;

import java.math.BigDecimal;

/**
 * Tamaño de pizza.
 */
public record TamanoPizzaResponse(
        Long id,
        String nombre,
        Integer diametroCm,
        Integer personasMin,
        Integer personasMax,
        BigDecimal precioBase
) {
}
