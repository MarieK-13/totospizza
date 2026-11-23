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
import com.totospizza.dto.request.catalogo.TipoMasaRequest;
import com.totospizza.dto.response.catalogo.TipoMasaResponse;
import com.totospizza.service.catalogo.TipoMasaService;

/** Administración de tipos de masa. */
@RestController
@RequestMapping("/api/v1/admin/tipos-masa")
@PreAuthorize("hasRole('ADMINISTRADOR')")
@RequiredArgsConstructor
public class AdminTipoMasaController {

    private final TipoMasaService tipoMasaService;

    @GetMapping
    public List<TipoMasaResponse> listar() {
        return tipoMasaService.listar();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TipoMasaResponse crear(@Valid @RequestBody TipoMasaRequest request) {
        return tipoMasaService.crear(request);
    }

    @PutMapping("/{id}")
    public TipoMasaResponse actualizar(@PathVariable Long id, @Valid @RequestBody TipoMasaRequest request) {
        return tipoMasaService.actualizar(id, request);
    }

    @PatchMapping("/{id}/activa")
    public TipoMasaResponse cambiarActiva(@PathVariable Long id,
                                          @Valid @RequestBody CambiarDisponibilidadRequest request) {
        return tipoMasaService.cambiarActiva(id, request);
    }
}
