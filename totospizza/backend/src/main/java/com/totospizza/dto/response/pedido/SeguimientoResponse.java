package com.totospizza.dto.response.pedido;

import java.time.Instant;
import java.util.List;

import com.totospizza.model.enums.EstadoPedido;

/**
 * Seguimiento en vivo del pedido (4 etapas y reloj de cuenta regresiva).
 */
public record SeguimientoResponse(
        Long pedidoId,
        String numero,
        EstadoPedido estado,
        List<EtapaSeguimientoResponse> etapas,
        Integer minutosRestantes,
        Instant entregaEstimada,
        String codigoEntrega,
        String nombreMotorizado,
        boolean garantiaAplicada
) {
}
