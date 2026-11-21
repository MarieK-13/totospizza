package com.totospizza.model.enums;

/**
 * Estado de un pedido. Cocina ve Pendientes (CONFIRMADO y EN_PREPARACION), En el horno (EN_HORNO) y Listas (LISTO). El cliente ve cuatro etapas: Preparación, Horno, En camino y Entregado.
 */
public enum EstadoPedido {

    PENDIENTE_PAGO("Pendiente de pago"),
    CONFIRMADO("Confirmado"),
    EN_PREPARACION("En preparación"),
    EN_HORNO("En el horno"),
    LISTO("Listo"),
    EN_CAMINO("En camino"),
    ENTREGADO("Entregado"),
    CANCELADO("Cancelado"),
    NO_RECOGIDO("No recogido");

    private final String etiqueta;

    EstadoPedido(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    /** Texto que se muestra al usuario. */
    public String getEtiqueta() {
        return etiqueta;
    }
}
