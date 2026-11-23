package com.totospizza.dto.request.operacion;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import com.totospizza.model.enums.EstadoPedido;

/**
 * Cambio de estado operativo de un pedido (cocina o despacho).
 */
public record CambiarEstadoPedidoRequest(
        @NotNull EstadoPedido estado,
        @Size(max = 250) String comentario
) {
}
