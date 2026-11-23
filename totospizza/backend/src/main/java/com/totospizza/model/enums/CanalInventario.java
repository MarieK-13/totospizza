package com.totospizza.model.enums;

/**
 * Canal al que pertenece un inventario. Online y físico se llevan por separado.
 */
public enum CanalInventario {

    ONLINE("Online"),
    FISICO("Físico");

    private final String etiqueta;

    CanalInventario(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    public String getEtiqueta() {
        return etiqueta;
    }
}
