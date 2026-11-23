package com.totospizza.dto.response.personalizacion;

import java.util.List;

import com.totospizza.dto.response.catalogo.TamanoPizzaResponse;
import com.totospizza.dto.response.catalogo.TipoMasaResponse;

/**
 * Todo lo necesario para armar la pizza en pantalla.
 */
public record OpcionesPersonalizacionResponse(
        List<TamanoPizzaResponse> tamanos,
        List<TipoMasaResponse> tiposMasa,
        List<PasoOpcionesResponse> pasos
) {
}
