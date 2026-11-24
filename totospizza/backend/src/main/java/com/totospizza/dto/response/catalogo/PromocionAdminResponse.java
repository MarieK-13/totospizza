package com.totospizza.dto.response.catalogo;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import com.totospizza.model.enums.ColorPromocion;
import com.totospizza.model.enums.TipoPromocion;

/**
 * Promoción vista por el administrador: incluye costo estimado, vigencia completa, estado y orden.
 */
public record PromocionAdminResponse(
        Long id,
        String titulo,
        String descripcion,
        TipoPromocion tipo,
        String etiqueta,
        BigDecimal precioPromocional,
        BigDecimal precioAnterior,
        BigDecimal costoEstimado,
        String imagenUrl,
        ColorPromocion colorFondo,
        String condiciones,
        Instant vigenteDesde,
        Instant vigenteHasta,
        boolean activa,
        Integer orden,
        List<PromocionItemResponse> items
) {
}
