package com.totospizza.exception;

/** Se violó una regla del negocio: fuera de cobertura, stock agotado, transición inválida (422). */
public class ReglaNegocioException extends NegocioException {

    public ReglaNegocioException(String codigo, String mensaje) {
        super(422, codigo, mensaje);
    }
}
