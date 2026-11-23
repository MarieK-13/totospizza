package com.totospizza.exception;

/** El recurso pedido no existe o no pertenece al usuario que lo pide (404). */
public class RecursoNoEncontradoException extends NegocioException {

    public RecursoNoEncontradoException(String recurso, Object id) {
        super(404, "RECURSO_NO_ENCONTRADO", recurso + " no encontrado: " + id);
    }
}
