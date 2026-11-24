package com.totospizza.dto.response.operacion;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import com.totospizza.dto.response.seguridad.DireccionResponse;
import com.totospizza.model.enums.EstadoEntrega;

/**
 * Entrega vista por el motorizado. No incluye el código de entrega.
 * horaPrometida = confirmación del pago + minutos estimados (lo que ve el cliente en su cuenta regresiva).
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
        Instant asignadaEn,
        List<ItemCocinaResponse> items,
        Instant recogidaEn,
        Instant horaPrometida,
        Integer intentosRestantes
) {
}
