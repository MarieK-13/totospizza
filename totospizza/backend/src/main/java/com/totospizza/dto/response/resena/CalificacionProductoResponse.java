package com.totospizza.dto.response.resena;

/**
 * Calificación de un producto.
 */
public record CalificacionProductoResponse(
        Long productoId,
        String productoNombre,
        Integer estrellas
) {
}
