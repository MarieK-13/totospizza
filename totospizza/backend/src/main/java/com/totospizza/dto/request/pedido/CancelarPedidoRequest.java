package com.totospizza.dto.request.pedido;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Cancelación de un pedido.
 */
public record CancelarPedidoRequest(
        @NotBlank @Size(max = 250) String motivo
) {
}
