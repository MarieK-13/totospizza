package com.totospizza.integration.pagos;

import java.math.BigDecimal;

import com.totospizza.model.enums.MetodoPago;

/**
 * Datos que se envían a la pasarela. 
 */
public record SolicitudCobro(
        String referencia,
        MetodoPago metodo,
        String tokenTarjeta,
        String telefonoBilletera,
        String codigoAprobacion,
        BigDecimal monto
) {
}
