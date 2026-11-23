package com.totospizza.dto.request.finanzas;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Genera la liquidación de un motorizado para un periodo.
 */
public record RegistrarPagoMotorizadoRequest(
        @NotNull @Positive Long empleadoId,
        @NotNull LocalDate periodoDesde,
        @NotNull LocalDate periodoHasta
) {
}
