package com.totospizza.dto.response.sucursal;

import java.time.DayOfWeek;
import java.time.LocalTime;

/**
 * Horario de un día.
 */
public record HorarioSucursalResponse(
        DayOfWeek diaSemana,
        LocalTime horaApertura,
        LocalTime horaCierre,
        boolean cerrado
) {
}
