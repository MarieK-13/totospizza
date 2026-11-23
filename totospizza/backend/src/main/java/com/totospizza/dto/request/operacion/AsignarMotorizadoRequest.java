package com.totospizza.dto.request.operacion;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * El despachador asigna un motorizado a un pedido listo.
 */
public record AsignarMotorizadoRequest(
        @NotNull @Positive Long motorizadoId
) {
}
