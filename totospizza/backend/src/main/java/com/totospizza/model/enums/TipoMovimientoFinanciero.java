package com.totospizza.model.enums;

/**
 * Tipo de movimiento de dinero.
 */
public enum TipoMovimientoFinanciero {

    INGRESO("Ingreso"),
    EGRESO("Egreso");

    private final String etiqueta;

    TipoMovimientoFinanciero(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    /** Texto que se muestra al usuario. */
    public String getEtiqueta() {
        return etiqueta;
    }
}
