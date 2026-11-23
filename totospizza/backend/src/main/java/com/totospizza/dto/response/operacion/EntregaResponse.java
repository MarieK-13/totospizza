package com.totospizza.dto.response.operacion;

import java.math.BigDecimal;
import java.time.Instant;

import com.totospizza.model.enums.EstadoEntrega;

/**
 * Entrega de un pedido.
 */
public record EntregaResponse(
        Long id,
        Long pedidoId,
        String numeroPedido,
        EstadoEntrega estado,
        String motorizadoNombre,
        Instant asignadaEn,
        Instant recogidaEn,
        Instant entregadaEn,
        BigDecimal distanciaKm
) {
}
