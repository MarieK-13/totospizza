package com.totospizza.controller.cliente;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.request.personalizacion.PizzaPersonalizadaRequest;
import com.totospizza.dto.response.personalizacion.PizzaPersonalizadaResponse;
import com.totospizza.security.userdetails.UsuarioAutenticado;
import com.totospizza.service.personalizacion.PizzaPersonalizadaService;

/** Pizzas armadas y guardadas por el cliente. */
@RestController
@RequestMapping("/api/v1/cliente/pizzas-personalizadas")
@PreAuthorize("hasRole('CLIENTE')")
@RequiredArgsConstructor
public class PizzaPersonalizadaController {

    private final PizzaPersonalizadaService pizzaService;

    @GetMapping
    public List<PizzaPersonalizadaResponse> listar(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return pizzaService.listar(usuario.id());
    }

    @GetMapping("/{id}")
    public PizzaPersonalizadaResponse obtener(@AuthenticationPrincipal UsuarioAutenticado usuario,
                                              @PathVariable Long id) {
        return pizzaService.obtener(usuario.id(), id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PizzaPersonalizadaResponse guardar(@AuthenticationPrincipal UsuarioAutenticado usuario,
                                              @Valid @RequestBody PizzaPersonalizadaRequest request) {
        return pizzaService.guardar(usuario.id(), request);
    }
}
