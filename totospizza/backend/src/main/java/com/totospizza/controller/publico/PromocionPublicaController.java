package com.totospizza.controller.publico;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.response.catalogo.PromocionResponse;
import com.totospizza.service.catalogo.PromocionService;

/** Promociones vigentes, visibles sin iniciar sesión. */
@RestController
@RequestMapping("/api/v1/publico/promociones")
@RequiredArgsConstructor
public class PromocionPublicaController {

    private final PromocionService promocionService;

    @GetMapping
    public List<PromocionResponse> vigentes() {
        return promocionService.vigentes();
    }
}
