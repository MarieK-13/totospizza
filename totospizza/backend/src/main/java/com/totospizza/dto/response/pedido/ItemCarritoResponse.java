package com.totospizza.dto.response.pedido;

import java.math.BigDecimal;
import java.util.List;

/**
 * Ítem del carrito.
 */
public record ItemCarritoResponse(
        Long id,
        String nombre,
        String descripcion,
        String imagenUrl,
        String tamano,
        String tipoMasa,
        Integer cantidad,
        BigDecimal precioUnitario,
        BigDecimal subtotal,
        String notas,
        List<AdicionalResponse> adicionales
) {
}
