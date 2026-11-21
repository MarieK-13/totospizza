package com.totospizza.model.enums;

/**
 * Situación laboral de un empleado.
 */
public enum EstadoEmpleado {

    ACTIVO("Activo"),
    EN_TURNO("En turno"),
    DISPONIBLE("Disponible"),
    INACTIVO("Inactivo"),
    CON_LICENCIA("Con licencia");

    private final String etiqueta;

    EstadoEmpleado(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    /** Texto que se muestra al usuario. */
    public String getEtiqueta() {
        return etiqueta;
    }
}
