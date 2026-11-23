package com.totospizza.model.enums;

/**
 * Estado de un pago.
 */
public enum EstadoPago {

    PENDIENTE("Pendiente"),
    APROBADO("Aprobado"),
    RECHAZADO("Rechazado"),
    REEMBOLSADO("Reembolsado");

    private final String etiqueta;

    EstadoPago(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    public String getEtiqueta() {
        return etiqueta;
    }
}
