package com.totospizza.dto.response.catalogo;

import java.math.BigDecimal;
import java.util.List;

/**
 * Detalle completo de un producto.
 */
public record ProductoDetalleResponse(
        Long id,
        CategoriaResponse categoria,
        String nombre,
        String slug,
        String descripcion,
        String imagenUrl,
        BigDecimal precioBase,
        boolean requiereTamano,
        boolean disponible,
        boolean destacado,
        BigDecimal calificacionPromedio,
        Integer totalResenas,
        List<EtiquetaResponse> etiquetas,
        List<PrecioTamanoResponse> precios,
        List<TipoMasaResponse> tiposMasa,
        List<IngredienteResponse> adicionales
) {
}
