package com.totospizza.exception;

/** El usuario está autenticado pero no puede realizar la acción (403). */
public class AccesoDenegadoException extends NegocioException {

    public AccesoDenegadoException(String codigo, String mensaje) {
        super(403, codigo, mensaje);
    }
}
