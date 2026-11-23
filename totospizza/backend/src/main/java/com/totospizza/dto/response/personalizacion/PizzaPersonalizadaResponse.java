package com.totospizza.dto.response.personalizacion;

import java.math.BigDecimal;
import java.util.List;

import com.totospizza.dto.response.catalogo.TamanoPizzaResponse;
import com.totospizza.dto.response.catalogo.TipoMasaResponse;

/**
 * Pizza personalizada guardada.
 */
public record PizzaPersonalizadaResponse(
        Long id,
        String nombre,
        TamanoPizzaResponse tamano,
        TipoMasaResponse tipoMasa,
        List<IngredienteSeleccionadoResponse> ingredientes,
        BigDecimal precioTotal
) {
}
