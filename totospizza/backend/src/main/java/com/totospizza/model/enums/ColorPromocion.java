package com.totospizza.model.enums;

/**
 * Color de fondo del banner de una promoción.
 */
public enum ColorPromocion {

    ROJO("Rojo"),
    VERDE("Verde"),
    BLANCO("Blanco");

    private final String etiqueta;

    ColorPromocion(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    /** Texto que se muestra al usuario. */
    public String getEtiqueta() {
        return etiqueta;
    }
}
