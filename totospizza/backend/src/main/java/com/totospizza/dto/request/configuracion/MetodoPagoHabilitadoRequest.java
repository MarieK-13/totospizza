package com.totospizza.dto.request.configuracion;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import com.totospizza.model.enums.MetodoPago;

/**
 * Habilita o deshabilita un método de pago.
 */
public record MetodoPagoHabilitadoRequest(
        @NotNull MetodoPago metodo,
        boolean activo,
        @Min(0) Integer orden
) {
}
