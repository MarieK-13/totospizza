package com.totospizza.controller.reparto;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.request.operacion.ConfirmarEntregaRequest;
import com.totospizza.dto.response.operacion.EntregaAsignadaResponse;
import com.totospizza.dto.response.operacion.EntregaResponse;
import com.totospizza.security.userdetails.UsuarioAutenticado;
import com.totospizza.service.operacion.RepartoService;

/** Entregas del motorizado: salir a ruta y confirmar con el PIN del cliente. */
@RestController
@RequestMapping("/api/v1/reparto")
@PreAuthorize("hasRole('MOTORIZADO')")
@RequiredArgsConstructor
public class RepartoController {

    private final RepartoService repartoService;

    @GetMapping("/entregas")
    public List<EntregaAsignadaResponse> misEntregas(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return repartoService.misEntregas(usuario.id());
    }

    @PostMapping("/entregas/{id}/iniciar-ruta")
    public EntregaResponse iniciarRuta(@AuthenticationPrincipal UsuarioAutenticado usuario, @PathVariable Long id) {
        return repartoService.iniciarRuta(usuario.id(), id);
    }

    @PostMapping("/entregas/{id}/confirmar")
    public EntregaResponse confirmarEntrega(@AuthenticationPrincipal UsuarioAutenticado usuario,
                                            @PathVariable Long id,
                                            @Valid @RequestBody ConfirmarEntregaRequest request) {
        return repartoService.confirmarEntrega(usuario.id(), id, request);
    }
}
