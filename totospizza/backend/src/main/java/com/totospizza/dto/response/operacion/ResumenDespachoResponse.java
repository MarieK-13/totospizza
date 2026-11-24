package com.totospizza.dto.response.operacion;

/**
 * Indicadores del mostrador: cuántos pedidos siguen en cocina (lo que viene),
 * cuántos se entregaron hoy y cuántos motorizados pueden salir ahora.
 */
public record ResumenDespachoResponse(
        long enCocina,
        long entregadosHoy,
        long motorizadosDisponibles
) {
}
