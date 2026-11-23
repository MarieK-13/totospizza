package com.totospizza.dto.response.pago;

import java.math.BigDecimal;
import java.time.Instant;

import com.totospizza.model.enums.EstadoPago;
import com.totospizza.model.enums.MetodoPago;

/**
 * Pago de un pedido
 */
public record PagoResponse(
        Long id,
        MetodoPago metodo,
        EstadoPago estado,
        BigDecimal monto,
        String marcaTarjeta,
        String ultimosDigitos,
        Instant pagadoEn,
        BigDecimal montoReembolsado
) {
}
