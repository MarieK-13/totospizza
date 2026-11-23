package com.totospizza.dto.response.pedido;

import java.math.BigDecimal;
import java.util.List;

/**
 * Línea de un pedido.
 */
public record DetallePedidoResponse(
        Long id,
        String nombre,
        String descripcion,
        Integer cantidad,
        BigDecimal precioUnitario,
        BigDecimal subtotal,
        String notas,
        List<AdicionalResponse> adicionales
) {
}
