package com.totospizza.dto.request.sucursal;

import java.time.DayOfWeek;
import java.time.LocalTime;

import jakarta.validation.constraints.NotNull;

/**
 * Horario de atención de un día.
 */
public record HorarioSucursalRequest(
        @NotNull DayOfWeek diaSemana,
        LocalTime horaApertura,
        LocalTime horaCierre,
        boolean cerrado
) {
}
