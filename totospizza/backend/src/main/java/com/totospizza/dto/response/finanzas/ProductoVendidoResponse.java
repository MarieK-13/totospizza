package com.totospizza.dto.response.finanzas;

import java.math.BigDecimal;

/**
 * Producto con sus ventas.
 */
public record ProductoVendidoResponse(
        String nombre,
        long cantidad,
        BigDecimal ingresos
) {
}
