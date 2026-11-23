package com.totospizza.dto.response.finanzas;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Reporte financiero de un periodo.
 */
public record FinanzasResponse(
        LocalDate desde,
        LocalDate hasta,
        BigDecimal ingresos,
        BigDecimal egresos,
        BigDecimal ganancia,
        BigDecimal deudaMotorizados,
        List<VentaDiariaResponse> ventasDiarias,
        List<VentaPorMetodoPagoResponse> ventasPorMetodo,
        RankingProductosResponse ranking,
        List<PagoMotorizadoResponse> pagosMotorizados
) {
}
