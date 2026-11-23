package com.totospizza.dto.response.personalizacion;

import java.util.List;

import com.totospizza.dto.response.catalogo.IngredienteResponse;

/**
 * Un paso del armado de pizza con sus opciones.
 */
public record PasoOpcionesResponse(
        Integer numero,
        String etiqueta,
        Integer maxSelecciones,
        List<IngredienteResponse> opciones
) {
}
