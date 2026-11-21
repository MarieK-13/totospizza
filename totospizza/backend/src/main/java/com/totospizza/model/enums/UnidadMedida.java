package com.totospizza.model.enums;

/**
 * Unidad de medida de un ingrediente.
 */
public enum UnidadMedida {

    KILOGRAMO("kg"),
    GRAMO("g"),
    LITRO("l"),
    MILILITRO("ml"),
    UNIDAD("unidad");

    private final String etiqueta;

    UnidadMedida(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    /** Texto que se muestra al usuario. */
    public String getEtiqueta() {
        return etiqueta;
    }
}
