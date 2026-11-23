package com.totospizza.exception;

/**
 * Base de los errores previstos por el negocio. Lleva el código HTTP y un código funcional
 * estable que el frontend usa para decidir qué mostrar. El manejador global la traduce a
 * {@code ApiError}.
 */
public abstract class NegocioException extends RuntimeException {

    private final int estado;
    private final String codigo;

    protected NegocioException(int estado, String codigo, String mensaje) {
        super(mensaje);
        this.estado = estado;
        this.codigo = codigo;
    }

    public int getEstado() {
        return estado;
    }

    public String getCodigo() {
        return codigo;
    }
}
