package com.totospizza.dto.response.pedido;

import java.util.List;

/**
 * Carrito activo del cliente.
 */
public record CarritoResponse(
        Long id,
        List<ItemCarritoResponse> items,
        Integer totalItems,
        ResumenMontosResponse montos
) {
}
