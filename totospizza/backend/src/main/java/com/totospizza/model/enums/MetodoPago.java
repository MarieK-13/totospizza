package com.totospizza.model.enums;

/**
 * Método de pago.
 */
public enum MetodoPago {

    TARJETA("Tarjeta de crédito / débito"),
    YAPE("Yape"),
    PLIN("Plin"),
    CMR("CMR"),
    EFECTIVO("Efectivo");

    private final String etiqueta;

    MetodoPago(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    /** Texto que se muestra al usuario. */
    public String getEtiqueta() {
        return etiqueta;
    }
}
