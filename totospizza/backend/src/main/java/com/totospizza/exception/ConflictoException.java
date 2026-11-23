package com.totospizza.exception;

/** El estado actual impide la operación: correo duplicado, reseña ya enviada (409). */
public class ConflictoException extends NegocioException {

    public ConflictoException(String codigo, String mensaje) {
        super(409, codigo, mensaje);
    }
}
