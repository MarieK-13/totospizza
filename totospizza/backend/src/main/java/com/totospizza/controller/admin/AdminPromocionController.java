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
import com.totospizza.dto.request.catalogo.PromocionRequest;
import com.totospizza.dto.response.catalogo.PromocionResponse;
import com.totospizza.service.catalogo.PromocionService;

/** Administración de promociones, incluidas las que se venden en pérdida. */
@RestController
@RequestMapping("/api/v1/admin/promociones")
@PreAuthorize("hasRole('ADMINISTRADOR')")
@RequiredArgsConstructor
public class AdminPromocionController {

    private final PromocionService promocionService;

    @GetMapping
    public List<PromocionResponse> listar() {
        return promocionService.listar();
    }

    @GetMapping("/en-perdida")
    public List<PromocionResponse> enPerdida() {
        return promocionService.enPerdida();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PromocionResponse crear(@Valid @RequestBody PromocionRequest request) {
        return promocionService.crear(request);
    }

    @PutMapping("/{id}")
    public PromocionResponse actualizar(@PathVariable Long id, @Valid @RequestBody PromocionRequest request) {
        return promocionService.actualizar(id, request);
    }

    @PatchMapping("/{id}/activa")
    public PromocionResponse cambiarActiva(@PathVariable Long id,
                                           @Valid @RequestBody CambiarDisponibilidadRequest request) {
        return promocionService.cambiarActiva(id, request);
    }
}
