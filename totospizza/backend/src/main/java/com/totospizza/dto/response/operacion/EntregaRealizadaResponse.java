package com.totospizza.dto.response.operacion;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Entrega que el motorizado ya completó. aTiempo es falso si se aplicó la garantía por demora.
 */
public record EntregaRealizadaResponse(
        Long entregaId,
        String numeroPedido,
        String nombreCliente,
        String distrito,
        BigDecimal distanciaKm,
        Instant recogidaEn,
        Instant entregadaEn,
        Integer minutosEnRuta,
        boolean aTiempo
) {
}
