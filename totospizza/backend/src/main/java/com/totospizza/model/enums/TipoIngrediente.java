package com.totospizza.model.enums;

/**
 * Clasificación de un ingrediente según el paso donde se elige.
 */
public enum TipoIngrediente {

    QUESO("Queso"),
    SALSA("Salsa"),
    CARNE("Carne"),
    OTRO("Otro ingrediente");

    private final String etiqueta;

    TipoIngrediente(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    /** Texto que se muestra al usuario. */
    public String getEtiqueta() {
        return etiqueta;
    }
}
