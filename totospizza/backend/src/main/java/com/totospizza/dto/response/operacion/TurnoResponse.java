package com.totospizza.dto.response.operacion;

import java.time.LocalDate;
import java.time.LocalTime;

import com.totospizza.model.enums.EstadoTurno;

/**
 * Turno de un empleado.
 */
public record TurnoResponse(
        Long id,
        Long empleadoId,
        String empleadoNombre,
        LocalDate fecha,
        LocalTime horaInicio,
        LocalTime horaFin,
        EstadoTurno estado,
        String puesto
) {
}
