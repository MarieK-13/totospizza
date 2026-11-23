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
import com.totospizza.dto.request.catalogo.IngredienteRequest;
import com.totospizza.dto.response.catalogo.IngredienteResponse;
import com.totospizza.service.catalogo.IngredienteService;

/** Administración de ingredientes y adicionales. */
@RestController
@RequestMapping("/api/v1/admin/ingredientes")
@PreAuthorize("hasRole('ADMINISTRADOR')")
@RequiredArgsConstructor
public class AdminIngredienteController {

    private final IngredienteService ingredienteService;

    @GetMapping
    public List<IngredienteResponse> listar() {
        return ingredienteService.listar();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public IngredienteResponse crear(@Valid @RequestBody IngredienteRequest request) {
        return ingredienteService.crear(request);
    }

    @PutMapping("/{id}")
    public IngredienteResponse actualizar(@PathVariable Long id, @Valid @RequestBody IngredienteRequest request) {
        return ingredienteService.actualizar(id, request);
    }

    @PatchMapping("/{id}/disponibilidad")
    public IngredienteResponse cambiarDisponibilidad(@PathVariable Long id,
                                                     @Valid @RequestBody CambiarDisponibilidadRequest request) {
        return ingredienteService.cambiarDisponibilidad(id, request);
    }
}
