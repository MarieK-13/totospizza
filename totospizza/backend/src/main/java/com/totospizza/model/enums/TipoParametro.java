package com.totospizza.model.enums;

/**
 * Tipo de dato de un parámetro del sistema.
 */
public enum TipoParametro {

    TEXTO("Texto"),
    NUMERO("Número"),
    BOOLEANO("Verdadero o falso");

    private final String etiqueta;

    TipoParametro(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    public String getEtiqueta() {
        return etiqueta;
    }
}
