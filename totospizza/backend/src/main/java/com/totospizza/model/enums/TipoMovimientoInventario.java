package com.totospizza.model.enums;

/**
 * Tipo de movimiento de inventario.
 */
public enum TipoMovimientoInventario {

    ENTRADA("Entrada"),
    SALIDA("Salida"),
    AJUSTE("Ajuste"),
    MERMA("Merma");

    private final String etiqueta;

    TipoMovimientoInventario(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    /** Texto que se muestra al usuario. */
    public String getEtiqueta() {
        return etiqueta;
    }
}
