package com.totospizza.dto.request.seguridad;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * Asignación de un turno a un empleado.
 */
public record AsignarHorarioRequest(
        @NotNull @FutureOrPresent LocalDate fecha,
        @NotNull LocalTime horaInicio,
        @NotNull LocalTime horaFin,
        @Size(max = 60) String puesto,
        @NotNull @Positive Long sucursalId
) {
}
