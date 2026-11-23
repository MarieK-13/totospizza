package com.totospizza.dto.response.catalogo;

import java.util.List;

/**
 * Opciones de filtrado del menú.
 */
public record MenuFiltrosResponse(
        List<CategoriaResponse> categorias,
        List<EtiquetaResponse> etiquetas
) {
}
