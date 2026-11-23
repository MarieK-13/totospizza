package com.totospizza.dto.response.catalogo;

/**
 * Producto incluido en una promoción.
 */
public record PromocionItemResponse(
        Long productoId,
        String productoNombre,
        String tamanoNombre,
        Integer cantidad
) {
}
