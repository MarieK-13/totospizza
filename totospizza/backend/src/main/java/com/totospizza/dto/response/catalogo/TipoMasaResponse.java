package com.totospizza.dto.response.catalogo;

import java.math.BigDecimal;

/**
 * Tipo de masa.
 */
public record TipoMasaResponse(
        Long id,
        String nombre,
        BigDecimal recargo,
        boolean activa
) {
}
