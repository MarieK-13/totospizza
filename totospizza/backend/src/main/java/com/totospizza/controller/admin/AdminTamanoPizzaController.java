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
import com.totospizza.dto.request.catalogo.TamanoPizzaRequest;
import com.totospizza.dto.response.catalogo.TamanoPizzaResponse;
import com.totospizza.service.catalogo.TamanoPizzaService;

/** Administración de los tamaños de pizza. */
@RestController
@RequestMapping("/api/v1/admin/tamanos")
@PreAuthorize("hasRole('ADMINISTRADOR')")
@RequiredArgsConstructor
public class AdminTamanoPizzaController {

    private final TamanoPizzaService tamanoService;

    @GetMapping
    public List<TamanoPizzaResponse> listar() {
        return tamanoService.listar();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TamanoPizzaResponse crear(@Valid @RequestBody TamanoPizzaRequest request) {
        return tamanoService.crear(request);
    }

    @PutMapping("/{id}")
    public TamanoPizzaResponse actualizar(@PathVariable Long id, @Valid @RequestBody TamanoPizzaRequest request) {
        return tamanoService.actualizar(id, request);
    }

    @PatchMapping("/{id}/activo")
    public TamanoPizzaResponse cambiarActivo(@PathVariable Long id,
                                             @Valid @RequestBody CambiarDisponibilidadRequest request) {
        return tamanoService.cambiarActivo(id, request);
    }
}
