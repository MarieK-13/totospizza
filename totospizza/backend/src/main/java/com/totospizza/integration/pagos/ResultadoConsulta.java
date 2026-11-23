package com.totospizza.integration.pagos;

/**
 * Estado de un cobro según la pasarela, consultado por la referencia del intento. Sirve para
 * conciliar cobros cuya respuesta se perdió.
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
        /** La pasarela aún lo está procesando. */
        PENDIENTE,
        /** La pasarela nunca recibió ese intento: no se cobró nada. */
        NO_ENCONTRADO
    }
}
