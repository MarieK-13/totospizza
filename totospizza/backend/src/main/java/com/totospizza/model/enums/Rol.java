package com.totospizza.model.enums;

/**
 * Rol de un usuario en el sistema.
 */
public enum Rol {

    ADMINISTRADOR("Administrador"),
    CLIENTE("Cliente"),
    PIZZERO("Pizzero"),
    DESPACHADOR("Despachador"),
    MOTORIZADO("Motorizado");

    private final String etiqueta;

    Rol(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    public String getEtiqueta() {
        return etiqueta;
    }
}
