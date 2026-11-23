package com.totospizza.dto.common;

/**
 * Respuesta simple con un mensaje, para operaciones sin cuerpo propio.
 */
public record MensajeResponse(
        String mensaje
) {

    public static MensajeResponse of(String mensaje) {
        return new MensajeResponse(mensaje);
    }
}
