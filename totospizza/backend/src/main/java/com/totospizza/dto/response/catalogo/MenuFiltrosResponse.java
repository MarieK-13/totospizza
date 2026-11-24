package com.totospizza.dto.response.catalogo;

import java.util.List;

/**
 * Opciones de filtrado del menú.
 */
public record MenuFiltrosResponse(
        List<CategoriaResponse> categorias,
        List<EtiquetaResponse> etiquetas,
        /** Tamaños de pizza con diámetro y personas, para el filtro "para cuántas personas". */
        List<TamanoPizzaResponse> tamanos
) {
}
