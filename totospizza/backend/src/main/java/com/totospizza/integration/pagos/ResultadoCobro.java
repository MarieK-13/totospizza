package com.totospizza.integration.pagos;

/** Respuesta de la pasarela a un cobro. */
public record ResultadoCobro(
        boolean aprobado,
        String referenciaExterna,
        String marcaTarjeta,
        String ultimosDigitos,
        String motivoRechazo
) {
}
