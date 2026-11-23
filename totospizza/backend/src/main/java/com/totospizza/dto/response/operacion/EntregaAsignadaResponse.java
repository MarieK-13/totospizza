package com.totospizza.dto.response.operacion;

import java.math.BigDecimal;
import java.time.Instant;

import com.totospizza.dto.response.seguridad.DireccionResponse;
import com.totospizza.model.enums.EstadoEntrega;

/**
 * Entrega vista por el motorizado. No incluye el código de entrega.
 */
public record EntregaAsignadaResponse(
        Long entregaId,
        Long pedidoId,
        String numeroPedido,
        String nombreCliente,
        String telefonoCliente,
        DireccionResponse direccion,
        String instrucciones,
        EstadoEntrega estado,
        BigDecimal distanciaKm,
        Instant asignadaEn
) {
}
