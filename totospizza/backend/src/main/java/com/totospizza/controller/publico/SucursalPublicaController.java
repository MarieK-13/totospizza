package com.totospizza.controller.publico;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.request.sucursal.ConsultaCoberturaRequest;
import com.totospizza.dto.response.sucursal.CoberturaResponse;
import com.totospizza.dto.response.sucursal.LocalesResponse;
import com.totospizza.dto.response.sucursal.SucursalResponse;
import com.totospizza.service.sucursal.SucursalService;

/** Locales y consulta de cobertura de delivery. */
@RestController
@RequestMapping("/api/v1/publico")
@RequiredArgsConstructor
public class SucursalPublicaController {

    private final SucursalService sucursalService;

    @GetMapping("/locales")
    public LocalesResponse locales() {
        return sucursalService.locales();
    }

    @GetMapping("/locales/{id}")
    public SucursalResponse local(@PathVariable Long id) {
        return sucursalService.obtener(id);
    }

    @PostMapping("/cobertura")
    public CoberturaResponse cobertura(@Valid @RequestBody ConsultaCoberturaRequest request) {
        return sucursalService.consultarCobertura(request);
    }
}
