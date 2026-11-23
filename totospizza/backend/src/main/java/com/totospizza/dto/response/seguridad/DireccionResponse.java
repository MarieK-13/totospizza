package com.totospizza.dto.response.seguridad;

import java.math.BigDecimal;

/**
 * Dirección con coordenadas.
 */
public record DireccionResponse(
        String direccion,
        String referencia,
        String distrito,
        BigDecimal latitud,
        BigDecimal longitud
) {
}
