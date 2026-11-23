package com.totospizza.dto.response.finanzas;

import java.math.BigDecimal;

import com.totospizza.model.enums.MetodoPago;

/**
 * Ventas por método de pago.
 */
public record VentaPorMetodoPagoResponse(
        MetodoPago metodo,
        BigDecimal total,
        long transacciones
) {
}
