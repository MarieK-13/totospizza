package com.totospizza.model.enums;

/**
 * Tipo de documento de identidad.
 */
public enum TipoDocumento {

    DNI("DNI"),
    CE("Carné de extranjería"),
    PASAPORTE("Pasaporte");

    private final String etiqueta;

    TipoDocumento(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    /** Texto que se muestra al usuario. */
    public String getEtiqueta() {
        return etiqueta;
    }
}
