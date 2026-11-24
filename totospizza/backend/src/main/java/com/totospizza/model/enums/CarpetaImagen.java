package com.totospizza.model.enums;

/**
 * Subcarpeta donde se guarda una imagen subida.
 */
public enum CarpetaImagen {

    PRODUCTOS,
    PROMOCIONES,
    SUCURSALES,
    NEGOCIO;

    public String ruta() {
        return name().toLowerCase(java.util.Locale.ROOT);
    }
}
