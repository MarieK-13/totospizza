package com.totospizza.dto.response.seguridad;

/**
 * Conteo de empleados por estado para el panel de administración.
 */
public record ResumenEmpleadosResponse(
        long total,
        long activos,
        long enTurno,
        long disponibles,
        long inactivos,
        long conLicencia
) {
}
