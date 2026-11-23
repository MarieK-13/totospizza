package com.totospizza.controller.publico;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.request.personalizacion.PizzaPersonalizadaRequest;
import com.totospizza.dto.response.personalizacion.CotizacionPizzaResponse;
import com.totospizza.dto.response.personalizacion.OpcionesPersonalizacionResponse;
import com.totospizza.service.personalizacion.PizzaPersonalizadaService;

/** Opciones y cotización del armado de pizza, sin sesión. */
@RestController
@RequestMapping("/api/v1/publico/personalizacion")
@RequiredArgsConstructor
public class PersonalizacionPublicaController {

    private final PizzaPersonalizadaService personalizacionService;

    @GetMapping("/opciones")
    public OpcionesPersonalizacionResponse opciones() {
        return personalizacionService.opciones();
    }

    @PostMapping("/cotizar")
    public CotizacionPizzaResponse cotizar(@Valid @RequestBody PizzaPersonalizadaRequest request) {
        return personalizacionService.cotizar(request);
    }
}
