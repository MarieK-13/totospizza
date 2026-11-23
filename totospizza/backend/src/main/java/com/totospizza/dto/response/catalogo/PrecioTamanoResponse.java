package com.totospizza.dto.response.catalogo;

import java.math.BigDecimal;

/**
 * Precio de un producto por tamaño.
 */
public record PrecioTamanoResponse(
        Long tamanoId,
        String tamanoNombre,
        BigDecimal precio
) {
}
