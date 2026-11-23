package com.totospizza.dto.response.catalogo;

/**
 * Etiqueta visual: alérgeno o característica dietética.
 */
public record EtiquetaResponse(
        Long id,
        String nombre,
        String slug,
        boolean esFiltro
) {
}
