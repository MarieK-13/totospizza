package com.totospizza.dto.response.personalizacion;

import java.math.BigDecimal;

import com.totospizza.model.enums.PasoPersonalizacion;

/**
 * Ingrediente elegido en una pizza personalizada.
 */
public record IngredienteSeleccionadoResponse(
        Long ingredienteId,
        String nombre,
        PasoPersonalizacion paso,
        BigDecimal precioAplicado
) {
}
