package com.totospizza.dto.response.operacion;

import java.time.Instant;
import java.util.List;

import com.totospizza.model.enums.EstadoPedido;
import com.totospizza.model.enums.TipoEntrega;

/**
 * Ticket de la pantalla de cocina. {@code estadoDesde} es cuándo entró a su estado actual
 * (por ejemplo, cuándo se metió al horno) y {@code minutosEnEstado} cuánto lleva en él.
 */
public record TicketCocinaResponse(
        Long pedidoId,
        String numero,
        EstadoPedido estado,
        TipoEntrega tipoEntrega,
        Instant confirmadoEn,
        Integer minutosTranscurridos,
        String instrucciones,
        List<ItemCocinaResponse> items,
        Instant estadoDesde,
        Integer minutosEnEstado,
        Instant listoEn
) {
}
