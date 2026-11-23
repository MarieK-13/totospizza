package com.totospizza.dto.response.pedido;

import java.math.BigDecimal;

/**
 * Desglose de montos. Envío gratis desde S/ 49; de lo contrario S/ 5.00.
 */
public record ResumenMontosResponse(
        BigDecimal subtotal,
        BigDecimal costoDelivery,
        BigDecimal descuento,
        BigDecimal total,
        BigDecimal envioGratisDesde,
        BigDecimal faltanteEnvioGratis
) {
}
