package com.totospizza.model.enums;

/**
 * Tipo de promoción.
 */
public enum TipoPromocion {

    COMBO("Combo"),
    DOS_POR_UNO("2x1"),
    DESCUENTO("Descuento"),
    OFERTA_FLASH("Oferta flash");

    private final String etiqueta;

    TipoPromocion(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    /** Texto que se muestra al usuario. */
    public String getEtiqueta() {
        return etiqueta;
    }
}
