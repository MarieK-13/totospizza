package com.totospizza.dto.response.catalogo;

/**
 * Categoría del menú.
 */
public record CategoriaResponse(
        Long id,
        String nombre,
        String slug
) {
}
