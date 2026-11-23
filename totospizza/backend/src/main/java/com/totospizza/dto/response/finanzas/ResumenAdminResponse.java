package com.totospizza.dto.response.finanzas;

import java.math.BigDecimal;
import java.util.List;

/**
 * Indicadores del dashboard del administrador.
 */
public record ResumenAdminResponse(
        BigDecimal gananciaSemanal,
        BigDecimal gananciaMensual,
        BigDecimal gananciaAnual,
        BigDecimal ventasHoy,
        long pedidosHoy,
        BigDecimal deudaMotorizados,
        long alertasStockBajo,
        List<PedidosPorEstadoResponse> pedidosPorEstado
) {
}
