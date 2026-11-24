package com.totospizza.exception;

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
