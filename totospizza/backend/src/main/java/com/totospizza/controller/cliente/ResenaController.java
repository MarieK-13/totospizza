package com.totospizza.controller.cliente;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.request.resena.ResenaRequest;
import com.totospizza.dto.response.resena.ResenaResponse;
import com.totospizza.security.userdetails.UsuarioAutenticado;
import com.totospizza.service.resena.ResenaService;

/** Reseñas que el cliente deja sobre sus pedidos entregados. */
@RestController
@RequestMapping("/api/v1/cliente/resenas")
@PreAuthorize("hasRole('CLIENTE')")
@RequiredArgsConstructor
public class ResenaController {

    private final ResenaService resenaService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResenaResponse crear(@AuthenticationPrincipal UsuarioAutenticado usuario,
                                @Valid @RequestBody ResenaRequest request) {
        return resenaService.crear(usuario.id(), request);
    }
}
