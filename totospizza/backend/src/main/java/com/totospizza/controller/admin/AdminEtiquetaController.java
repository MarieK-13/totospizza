package com.totospizza.controller.admin;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.request.catalogo.EtiquetaRequest;
import com.totospizza.dto.response.catalogo.EtiquetaResponse;
import com.totospizza.service.catalogo.EtiquetaService;

/** Administración de etiquetas y alérgenos. */
@RestController
@RequestMapping("/api/v1/admin/etiquetas")
@PreAuthorize("hasRole('ADMINISTRADOR')")
@RequiredArgsConstructor
public class AdminEtiquetaController {

    private final EtiquetaService etiquetaService;

    @GetMapping
    public List<EtiquetaResponse> listar() {
        return etiquetaService.listar();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EtiquetaResponse crear(@Valid @RequestBody EtiquetaRequest request) {
        return etiquetaService.crear(request);
    }

    @PutMapping("/{id}")
    public EtiquetaResponse actualizar(@PathVariable Long id, @Valid @RequestBody EtiquetaRequest request) {
        return etiquetaService.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        etiquetaService.eliminar(id);
    }
}
