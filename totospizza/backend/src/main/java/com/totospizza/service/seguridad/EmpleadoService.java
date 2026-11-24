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
}
