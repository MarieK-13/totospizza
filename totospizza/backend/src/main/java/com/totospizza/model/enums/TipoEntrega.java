package com.totospizza.model.enums;

/**
 * Forma en que el cliente recibe su pedido.
 */
public enum TipoEntrega {

    DELIVERY("Delivery"),
    RECOJO("Recojo en tienda");

    private final String etiqueta;

    TipoEntrega(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    public String getEtiqueta() {
        return etiqueta;
    }
}
