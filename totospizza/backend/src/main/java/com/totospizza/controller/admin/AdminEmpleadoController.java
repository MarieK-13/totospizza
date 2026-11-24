package com.totospizza.controller.admin;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;

import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

import com.totospizza.controller.comun.Paginas;
import com.totospizza.dto.common.PageResponse;
import com.totospizza.dto.request.seguridad.AsignarHorarioRequest;
import com.totospizza.dto.request.seguridad.CambiarEstadoEmpleadoRequest;
import com.totospizza.dto.request.seguridad.EmpleadoRequest;
import com.totospizza.dto.response.operacion.TurnoResponse;
import com.totospizza.dto.response.seguridad.EmpleadoResponse;
import com.totospizza.dto.response.seguridad.ResumenEmpleadosResponse;
import com.totospizza.model.enums.EstadoEmpleado;
import com.totospizza.model.enums.Rol;
import com.totospizza.service.seguridad.EmpleadoService;

/** Administración de empleados y de sus turnos. */
@RestController
@RequestMapping("/api/v1/admin/empleados")
@PreAuthorize("hasRole('ADMINISTRADOR')")
@RequiredArgsConstructor
public class AdminEmpleadoController {

    private final EmpleadoService empleadoService;

    @GetMapping
    public PageResponse<EmpleadoResponse> buscar(@RequestParam(required = false) Long sucursalId,
                                                 @RequestParam(required = false) Rol rol,
                                                 @RequestParam(required = false) EstadoEmpleado estado,
                                                 @RequestParam(name = "q", required = false) String texto,
                                                 @RequestParam(defaultValue = "0") int pagina,
                                                 @RequestParam(defaultValue = "20") int tamano) {
        return empleadoService.buscar(sucursalId, rol, estado, texto,
                Paginas.de(pagina, tamano, Sort.by("usuario.nombres")));
    }

    @GetMapping("/resumen")
    public ResumenEmpleadosResponse resumen(@RequestParam Long sucursalId) {
        return empleadoService.resumen(sucursalId);
    }

    @GetMapping("/{id}")
    public EmpleadoResponse obtener(@PathVariable Long id) {
        return empleadoService.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EmpleadoResponse crear(@Valid @RequestBody EmpleadoRequest request) {
        return empleadoService.crear(request);
    }

    @PutMapping("/{id}")
    public EmpleadoResponse actualizar(@PathVariable Long id, @Valid @RequestBody EmpleadoRequest request) {
        return empleadoService.actualizar(id, request);
    }

    @PatchMapping("/{id}/estado")
    public EmpleadoResponse cambiarEstado(@PathVariable Long id,
                                          @Valid @RequestBody CambiarEstadoEmpleadoRequest request) {
        return empleadoService.cambiarEstado(id, request);
    }

    @PostMapping("/{id}/turnos")
    @ResponseStatus(HttpStatus.CREATED)
    public TurnoResponse asignarHorario(@PathVariable Long id, @Valid @RequestBody AsignarHorarioRequest request) {
        return empleadoService.asignarHorario(id, request);
    }

    @GetMapping("/{id}/turnos")
    public List<TurnoResponse> turnos(@PathVariable Long id,
                                      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
                                      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return empleadoService.turnos(id, desde, hasta);
    }
}
