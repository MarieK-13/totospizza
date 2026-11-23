package com.totospizza.repository.seguridad.projection;

import com.totospizza.model.enums.EstadoEmpleado;

/**
 * Cantidad de empleados por estado laboral. Alimenta las tarjetas de resumen del panel de empleados.
 */
public interface EmpleadosPorEstado {

    EstadoEmpleado getEstado();
    Long getCantidad();
}
