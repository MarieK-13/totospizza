package com.totospizza.dto.response.finanzas;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

import com.totospizza.model.enums.EstadoPagoPersonal;

/**
 * Liquidación de un motorizado.
 */
public record PagoMotorizadoResponse(
        Long id,
        Long empleadoId,
        String motorizadoNombre,
        LocalDate periodoDesde,
        LocalDate periodoHasta,
        Integer totalEntregas,
        BigDecimal montoBase,
        BigDecimal montoBonos,
        BigDecimal montoTotal,
        EstadoPagoPersonal estado,
        Instant pagadoEn
) {
}
