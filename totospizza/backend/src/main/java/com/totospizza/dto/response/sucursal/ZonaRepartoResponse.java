package com.totospizza.dto.response.sucursal;

import java.math.BigDecimal;

/**
 * Zona de reparto.
 */
public record ZonaRepartoResponse(
        Long id,
        String nombre,
        BigDecimal distanciaDesdeKm,
        BigDecimal distanciaHastaKm,
        BigDecimal costoEnvio
) {
}
