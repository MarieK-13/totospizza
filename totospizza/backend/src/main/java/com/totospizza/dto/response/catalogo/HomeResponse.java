package com.totospizza.dto.response.catalogo;

import java.util.List;

import com.totospizza.dto.response.configuracion.ConfiguracionPublicaResponse;
import com.totospizza.dto.response.resena.ResenaResponse;

/**
 * Contenido de la página de inicio en una sola llamada.
 */
public record HomeResponse(
        List<PromocionResponse> promociones,
        List<ProductoResumenResponse> destacados,
        List<ResenaResponse> resenas,
        ConfiguracionPublicaResponse negocio
) {
}
