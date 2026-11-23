package com.totospizza.model.enums;

/**
 * Método de pago.
 */
public enum MetodoPago {

    TARJETA("Tarjeta de crédito / débito"),
    YAPE("Yape"),
    PLIN("Plin"),
    CMR("CMR");

    private final String etiqueta;

    MetodoPago(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    public String getEtiqueta() {
        return etiqueta;
    }
}
