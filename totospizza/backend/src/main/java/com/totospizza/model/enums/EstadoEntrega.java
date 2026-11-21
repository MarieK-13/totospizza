package com.totospizza.model.enums;

/**
 * Estado del reparto de un pedido.
 */
public enum EstadoEntrega {

    SIN_ASIGNAR("Sin asignar"),
    ASIGNADA("Asignada"),
    EN_CAMINO("En camino"),
    ENTREGADA("Entregada"),
    FALLIDA("Fallida");

    private final String etiqueta;

    EstadoEntrega(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    /** Texto que se muestra al usuario. */
    public String getEtiqueta() {
        return etiqueta;
    }
}
