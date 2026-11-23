package com.totospizza.integration.pagos;

import java.math.BigDecimal;

import com.totospizza.model.enums.MetodoPago;

/**
 * Datos que se envían a la pasarela. Nunca incluye número de tarjeta ni CVV: el frontend los
 * tokeniza directamente con la pasarela y solo nos entrega el token.
 */
public record SolicitudCobro(
        String referencia,
        MetodoPago metodo,
        String tokenTarjeta,
        String telefonoBilletera,
        BigDecimal monto
) {
}
