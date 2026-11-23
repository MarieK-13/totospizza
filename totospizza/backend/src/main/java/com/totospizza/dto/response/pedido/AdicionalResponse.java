package com.totospizza.dto.response.pedido;

import java.math.BigDecimal;

/**
 * Adicional de un ítem.
 */
public record AdicionalResponse(
        Long ingredienteId,
        String nombre,
        Integer cantidad,
        BigDecimal precioUnitario
) {
}
