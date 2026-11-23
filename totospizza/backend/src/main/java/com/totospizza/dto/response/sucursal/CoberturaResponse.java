package com.totospizza.dto.response.sucursal;

import java.math.BigDecimal;

/**
 * Resultado de la validación de cobertura.
 */
public record CoberturaResponse(
        boolean dentroCobertura,
        BigDecimal distanciaKm,
        Long sucursalId,
        String sucursalNombre,
        BigDecimal costoEnvio,
        Integer minutosEstimados,
        String mensaje
) {
}
