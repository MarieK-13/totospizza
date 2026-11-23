package com.totospizza.model.enums;

/**
 * Paso del asistente de personalización de pizza, con el máximo de opciones que se pueden elegir.
 */
public enum PasoPersonalizacion {

    TAMANO_MASA(1, "Tamaño y masa", 1),
    QUESO(2, "Tipo de queso", 2),
    SALSA(3, "Salsas", 2),
    INGREDIENTES(4, "Ingredientes", 2),
    RESUMEN(5, "Mi pizza", 0);

    private final int numero;
    private final String etiqueta;
    private final int maxSelecciones;

    PasoPersonalizacion(int numero, String etiqueta, int maxSelecciones) {
        this.numero = numero;
        this.etiqueta = etiqueta;
        this.maxSelecciones = maxSelecciones;
    }

    public int getNumero() {
        return numero;
    }

    public String getEtiqueta() {
        return etiqueta;
    }

    /** Cantidad máxima de opciones que se pueden elegir en el paso. */
    public int getMaxSelecciones() {
        return maxSelecciones;
    }
}
