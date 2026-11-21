package com.totospizza.model.enums;

/**
 * Tipo de notificación.
 */
public enum TipoNotificacion {

    PEDIDO_NUEVO("Pedido nuevo"),
    PEDIDO_LISTO("Pedido listo"),
    ENTREGA_ASIGNADA("Entrega asignada"),
    STOCK_BAJO("Stock bajo"),
    ALERTA_OFERTA_FLASH("Alerta de oferta flash"),
    SISTEMA("Sistema");

    private final String etiqueta;

    TipoNotificacion(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    /** Texto que se muestra al usuario. */
    public String getEtiqueta() {
        return etiqueta;
    }
}
