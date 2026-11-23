package com.totospizza.dto.response.finanzas;

import java.math.BigDecimal;
import java.time.Instant;

import com.totospizza.model.enums.TipoMovimientoFinanciero;

/**
 * Movimiento financiero.
 */
public record MovimientoFinancieroResponse(
        Long id,
        TipoMovimientoFinanciero tipo,
        String concepto,
        BigDecimal monto,
        Instant ocurridoEn,
        String numeroPedido
) {
}
