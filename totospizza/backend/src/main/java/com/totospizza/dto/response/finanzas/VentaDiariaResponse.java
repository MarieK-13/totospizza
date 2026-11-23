package com.totospizza.dto.response.finanzas;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Ventas de un día.
 */
public record VentaDiariaResponse(
        LocalDate fecha,
        BigDecimal total,
        long pedidos
) {
}
