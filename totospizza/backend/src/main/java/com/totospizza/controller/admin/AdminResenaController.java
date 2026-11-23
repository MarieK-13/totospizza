package com.totospizza.controller.admin;

import jakarta.validation.Valid;

import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import com.totospizza.controller.comun.Paginas;
import com.totospizza.dto.common.PageResponse;
import com.totospizza.dto.request.catalogo.CambiarDisponibilidadRequest;
import com.totospizza.dto.response.resena.ResenaResponse;
import com.totospizza.service.resena.ResenaService;

/** Moderación de reseñas: destacar u ocultar. */
@RestController
@RequestMapping("/api/v1/admin/resenas")
@PreAuthorize("hasRole('ADMINISTRADOR')")
@RequiredArgsConstructor
public class AdminResenaController {

    private final ResenaService resenaService;

    @GetMapping
    public PageResponse<ResenaResponse> listar(@RequestParam(defaultValue = "0") int pagina,
                                               @RequestParam(defaultValue = "20") int tamano) {
        return resenaService.listar(Paginas.de(pagina, tamano, Sort.by(Sort.Direction.DESC, "creadoEn")));
    }

    @PatchMapping("/{id}/destacada")
    public ResenaResponse cambiarDestacada(@PathVariable Long id,
                                           @Valid @RequestBody CambiarDisponibilidadRequest request) {
        return resenaService.cambiarDestacada(id, request);
    }

    @PatchMapping("/{id}/visible")
    public ResenaResponse cambiarVisible(@PathVariable Long id,
                                         @Valid @RequestBody CambiarDisponibilidadRequest request) {
        return resenaService.cambiarVisible(id, request);
    }
}
