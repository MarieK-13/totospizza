package com.totospizza.dto.response.catalogo;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import com.totospizza.model.enums.ColorPromocion;
import com.totospizza.model.enums.TipoPromocion;

/**
 * Promoción vigente para el cliente. No expone el costo estimado.
 */
public record PromocionResponse(
        Long id,
        String titulo,
        String descripcion,
        TipoPromocion tipo,
        String etiqueta,
        BigDecimal precioPromocional,
        BigDecimal precioAnterior,
        String imagenUrl,
        ColorPromocion colorFondo,
        String condiciones,
        Instant vigenteHasta,
        List<PromocionItemResponse> items
) {
}
