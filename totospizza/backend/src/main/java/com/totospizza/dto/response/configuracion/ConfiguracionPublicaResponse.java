package com.totospizza.dto.response.configuracion;

import java.math.BigDecimal;
import java.util.List;

import com.totospizza.dto.response.pago.MetodoPagoDisponibleResponse;

/**
 * Datos públicos para el sitio: contacto, envío y pagos.
 */
public record ConfiguracionPublicaResponse(
        String nombreComercial,
        String logoUrl,
        String whatsapp,
        String instagramUrl,
        String facebookUrl,
        BigDecimal envioGratisDesde,
        BigDecimal costoDeliveryBase,
        BigDecimal radioCoberturaKm,
        List<MetodoPagoDisponibleResponse> metodosPago
) {
}
