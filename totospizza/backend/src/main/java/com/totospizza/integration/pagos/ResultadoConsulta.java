package com.totospizza.integration.pagos;

/**
 * Estado de un cobro según la pasarela.
 */
public record ResultadoConsulta(
        Estado estado,
        String referenciaExterna,
        String marcaTarjeta,
        String ultimosDigitos,
        String motivoRechazo
) {

    public enum Estado {
        APROBADO,
        RECHAZADO,
        PENDIENTE,
        NO_ENCONTRADO
    }
}
