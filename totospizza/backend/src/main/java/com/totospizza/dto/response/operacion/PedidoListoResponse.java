package com.totospizza.dto.response.operacion;

import java.time.Instant;

import com.totospizza.model.enums.EstadoEntrega;
import com.totospizza.model.enums.TipoEntrega;

/**
 * Pedido listo en el mostrador del despachador.
 */
public record PedidoListoResponse(
        Long pedidoId,
        String numero,
        TipoEntrega tipoEntrega,
        String nombreCliente,
        Integer cantidadItems,
        Instant listoEn,
        EstadoEntrega estadoEntrega,
        String motorizadoNombre,
        Instant vencimientoRecojo
) {
}
