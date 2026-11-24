package com.totospizza.dto.response.operacion;

import java.util.List;

/**
 * Tablero del pizzero: lo que hay que preparar (confirmados y en preparación), lo que está en el horno,
 * lo que ya está listo esperando en el mostrador, cuántos pedidos salieron de cocina hoy y el tiempo
 * objetivo de cocina por pedido (parámetro {@code minutos_preparacion}).
 */
public record TableroCocinaResponse(
        List<TicketCocinaResponse> porPreparar,
        List<TicketCocinaResponse> enHorno,
        List<TicketCocinaResponse> listos,
        long preparadosHoy,
        Integer minutosObjetivo
) {
}
