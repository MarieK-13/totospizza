package com.totospizza.dto.response.operacion;

import java.math.BigDecimal;
import java.util.List;

/**
 * Jornada del motorizado (hoy, hora de Lima): entregas completadas, kilómetros, bono acumulado
 * según su bono por entrega, tiempo promedio en ruta y las últimas entregas.
 */
public record ResumenRepartoResponse(
        long entregadasHoy,
        BigDecimal kmHoy,
        BigDecimal bonoPorEntrega,
        BigDecimal bonosHoy,
        Integer minutosPromedioRuta,
        List<EntregaRealizadaResponse> entregadasHoyDetalle
) {
}
