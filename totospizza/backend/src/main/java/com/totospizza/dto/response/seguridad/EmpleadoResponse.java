package com.totospizza.dto.response.seguridad;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

import com.totospizza.model.enums.EstadoEmpleado;
import com.totospizza.model.enums.Rol;
import com.totospizza.model.enums.TipoDocumento;

/**
 * Empleado con su información laboral.
 */
public record EmpleadoResponse(
        Long id,
        Long usuarioId,
        String nombreCompleto,
        String correo,
        String telefono,
        Rol rol,
        Long sucursalId,
        String sucursalNombre,
        EstadoEmpleado estado,
        LocalTime horaInicio,
        LocalTime horaFin,
        LocalDate fechaIngreso,
        BigDecimal pagoBaseTurno,
        BigDecimal bonoPorEntrega,
        String nombres,
        String apellidos,
        TipoDocumento tipoDocumento,
        String numeroDocumento
) {
}
