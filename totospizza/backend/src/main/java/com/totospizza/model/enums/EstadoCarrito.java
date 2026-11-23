package com.totospizza.model.enums;

/**
 * Estado de un carrito.
 */
public enum EstadoCarrito {

    ACTIVO("Activo"),
    CONVERTIDO("Convertido en pedido"),
    ABANDONADO("Abandonado");

    private final String etiqueta;

    EstadoCarrito(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    public String getEtiqueta() {
        return etiqueta;
    }
}
