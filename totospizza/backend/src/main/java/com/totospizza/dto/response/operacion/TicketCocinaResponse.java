package com.totospizza.dto.response.operacion;

import java.time.Instant;
import java.util.List;

import com.totospizza.model.enums.EstadoPedido;
import com.totospizza.model.enums.TipoEntrega;

/**
 * Ticket de la pantalla de cocina.
 */
public record TicketCocinaResponse(
        Long pedidoId,
        String numero,
        EstadoPedido estado,
        TipoEntrega tipoEntrega,
        Instant confirmadoEn,
        Integer minutosTranscurridos,
        String instrucciones,
        List<ItemCocinaResponse> items
) {
}
