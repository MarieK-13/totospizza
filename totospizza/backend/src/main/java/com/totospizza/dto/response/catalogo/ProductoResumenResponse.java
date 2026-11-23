package com.totospizza.dto.response.catalogo;

import java.math.BigDecimal;
import java.util.List;

/**
 * Tarjeta de producto para listados.
 */
public record ProductoResumenResponse(
        Long id,
        String nombre,
        String slug,
        String descripcion,
        String imagenUrl,
        BigDecimal precioDesde,
        String categoria,
        boolean disponible,
        boolean destacado,
        BigDecimal calificacionPromedio,
        Integer totalResenas,
        List<EtiquetaResponse> etiquetas
) {
}
