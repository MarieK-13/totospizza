package com.totospizza.service.operacion;

import com.totospizza.dto.response.operacion.TableroCocinaResponse;

/**
 * Pantalla de cocina del pizzero: solo lo que hay que preparar. Cada acción devuelve el tablero
 * actualizado de la sucursal del pizzero para refrescar la pantalla sin otra llamada.
 */
public interface CocinaService {

    TableroCocinaResponse tablero(Long usuarioId);

    /** CONFIRMADO → EN_PREPARACION. */
    TableroCocinaResponse iniciarPreparacion(Long usuarioId, Long pedidoId);

    /** La pizza entra al horno. */
    TableroCocinaResponse enviarAlHorno(Long usuarioId, Long pedidoId);

    /** EN_HORNO → LISTO. Avisa al despachador. */
    TableroCocinaResponse marcarListo(Long usuarioId, Long pedidoId);
}
