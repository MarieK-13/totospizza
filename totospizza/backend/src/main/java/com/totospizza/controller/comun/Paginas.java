package com.totospizza.controller.comun;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

/**
 * Arma el {@link Pageable} de un listado. El cliente elige página y tamaño, pero nunca el orden:
 * ordenar por una propiedad arbitraria rompería las consultas que ya traen su propio orden y
 * expondría el modelo interno. El orden lo fija cada endpoint.
 */
public final class Paginas {

    public static final int TAMANO_MAXIMO = 100;

    private Paginas() {
    }

    public static Pageable de(int pagina, int tamano) {
        return PageRequest.of(Math.max(pagina, 0), tamanoAcotado(tamano));
    }

    public static Pageable de(int pagina, int tamano, Sort orden) {
        return PageRequest.of(Math.max(pagina, 0), tamanoAcotado(tamano), orden);
    }

    private static int tamanoAcotado(int tamano) {
        return Math.min(Math.max(tamano, 1), TAMANO_MAXIMO);
    }
}
