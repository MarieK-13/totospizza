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
    SISTEMA("Sistema"),
    PEDIDO_EN_CAMINO("Pedido en camino"),
    ENTREGA_FALLIDA("Entrega fallida");

    private final String etiqueta;

    TipoNotificacion(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    public String getEtiqueta() {
        return etiqueta;
    }
}
