package com.totospizza.dto.response.pago;

import com.totospizza.model.enums.MetodoPago;

/**
 * Método de pago ofrecido en el checkout.
 */
public record MetodoPagoDisponibleResponse(
        MetodoPago metodo,
        String etiqueta,
        Integer orden
) {
}
