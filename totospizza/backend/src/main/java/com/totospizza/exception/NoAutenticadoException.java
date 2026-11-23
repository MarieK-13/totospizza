package com.totospizza.exception;

/** Credenciales o token inválidos (401). El mensaje no debe revelar qué dato falló. */
public class NoAutenticadoException extends NegocioException {

    public NoAutenticadoException(String codigo, String mensaje) {
        super(401, codigo, mensaje);
    }
}
