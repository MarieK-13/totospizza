package com.totospizza.controller.admin;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.request.catalogo.CambiarDisponibilidadRequest;
import com.totospizza.dto.request.sucursal.SucursalRequest;
import com.totospizza.dto.response.sucursal.SucursalResponse;
import com.totospizza.service.sucursal.SucursalService;

/** Administración de sucursales: horarios, zonas de reparto y cobertura. */
@RestController
@RequestMapping("/api/v1/admin/sucursales")
@PreAuthorize("hasRole('ADMINISTRADOR')")
@RequiredArgsConstructor
public class AdminSucursalController {

    private final SucursalService sucursalService;

    @GetMapping
    public List<SucursalResponse> listar() {
        return sucursalService.listar();
    }

    @GetMapping("/{id}")
    public SucursalResponse obtener(@PathVariable Long id) {
        return sucursalService.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SucursalResponse crear(@Valid @RequestBody SucursalRequest request) {
        return sucursalService.crear(request);
    }

    @PutMapping("/{id}")
    public SucursalResponse actualizar(@PathVariable Long id, @Valid @RequestBody SucursalRequest request) {
        return sucursalService.actualizar(id, request);
    }

    @PatchMapping("/{id}/activa")
    public SucursalResponse cambiarActiva(@PathVariable Long id,
                                          @Valid @RequestBody CambiarDisponibilidadRequest request) {
        return sucursalService.cambiarActiva(id, request);
    }
}
