package com.totospizza.service.seguridad;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Pageable;

import com.totospizza.dto.common.PageResponse;
import com.totospizza.dto.request.seguridad.AsignarHorarioRequest;
import com.totospizza.dto.request.seguridad.CambiarEstadoEmpleadoRequest;
import com.totospizza.dto.request.seguridad.EmpleadoRequest;
import com.totospizza.dto.response.operacion.TurnoResponse;
import com.totospizza.dto.response.seguridad.EmpleadoResponse;
import com.totospizza.dto.response.seguridad.ResumenEmpleadosResponse;
import com.totospizza.model.enums.EstadoEmpleado;
import com.totospizza.model.enums.Rol;


public interface EmpleadoService {

    PageResponse<EmpleadoResponse> buscar(Long sucursalId, Rol rol, EstadoEmpleado estado, String texto, Pageable pageable);

    ResumenEmpleadosResponse resumen(Long sucursalId);

    EmpleadoResponse obtener(Long empleadoId);

    EmpleadoResponse crear(EmpleadoRequest request);

    EmpleadoResponse actualizar(Long empleadoId, EmpleadoRequest request);

    EmpleadoResponse cambiarEstado(Long empleadoId, CambiarEstadoEmpleadoRequest request);

    TurnoResponse asignarHorario(Long empleadoId, AsignarHorarioRequest request);

    List<TurnoResponse> turnos(Long empleadoId, LocalDate desde, LocalDate hasta);

    /**
     * Avanza los turnos según la hora de la sede: PROGRAMADO pasa a EN_CURSO al llegar la hora de inicio
     * y a FINALIZADO al pasar la hora de fin. Devuelve cuántos cambiaron.
     */
    int actualizarTurnos();

    /** Marca como cancelado un turno al que el empleado no asistió: deja de contar para el pago base. */
    TurnoResponse cancelarTurno(Long empleadoId, Long turnoId);
}
