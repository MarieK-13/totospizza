package com.totospizza.dto.request.seguridad;

import jakarta.validation.constraints.NotNull;

import com.totospizza.model.enums.EstadoEmpleado;

/**
 * Cambio de estado de un empleado.
 */
public record CambiarEstadoEmpleadoRequest(
        @NotNull EstadoEmpleado estado
) {
}
