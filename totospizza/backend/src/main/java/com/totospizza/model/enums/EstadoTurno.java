package com.totospizza.model.enums;

/**
 * Estado de un turno de trabajo.
 */
public enum EstadoTurno {

    PROGRAMADO("Programado"),
    EN_CURSO("En curso"),
    FINALIZADO("Finalizado");

    private final String etiqueta;

    EstadoTurno(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    /** Texto que se muestra al usuario. */
    public String getEtiqueta() {
        return etiqueta;
    }
}
