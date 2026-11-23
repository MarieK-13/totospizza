package com.totospizza.dto.response.personalizacion;

import java.math.BigDecimal;

/**
 * Precio en vivo de la pizza que se está armando.
 */
public record CotizacionPizzaResponse(
        BigDecimal precioTamano,
        BigDecimal recargoMasa,
        BigDecimal totalIngredientes,
        BigDecimal total
) {
}
