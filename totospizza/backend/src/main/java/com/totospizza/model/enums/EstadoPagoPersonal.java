package com.totospizza.model.enums;

/**
 * Estado del pago a un motorizado.
 */
public enum EstadoPagoPersonal {

    PENDIENTE("Pendiente"),
    PAGADO("Pagado");

    private final String etiqueta;

    EstadoPagoPersonal(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    public String getEtiqueta() {
        return etiqueta;
    }
}
