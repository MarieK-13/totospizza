package com.totospizza.controller.cocina;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.response.operacion.TableroCocinaResponse;
import com.totospizza.security.userdetails.UsuarioAutenticado;
import com.totospizza.service.operacion.CocinaService;

/** Pantalla de cocina: el pizzero ve y avanza sus pedidos. */
@RestController
@RequestMapping("/api/v1/cocina")
@PreAuthorize("hasRole('PIZZERO')")
@RequiredArgsConstructor
public class CocinaController {

    private final CocinaService cocinaService;

    @GetMapping("/tablero")
    public TableroCocinaResponse tablero(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return cocinaService.tablero(usuario.id());
    }

    @PostMapping("/pedidos/{id}/iniciar-preparacion")
    public TableroCocinaResponse iniciarPreparacion(@AuthenticationPrincipal UsuarioAutenticado usuario,
                                                    @PathVariable Long id) {
        return cocinaService.iniciarPreparacion(usuario.id(), id);
    }

    @PostMapping("/pedidos/{id}/enviar-al-horno")
    public TableroCocinaResponse enviarAlHorno(@AuthenticationPrincipal UsuarioAutenticado usuario,
                                               @PathVariable Long id) {
        return cocinaService.enviarAlHorno(usuario.id(), id);
    }

    @PostMapping("/pedidos/{id}/marcar-listo")
    public TableroCocinaResponse marcarListo(@AuthenticationPrincipal UsuarioAutenticado usuario,
                                             @PathVariable Long id) {
        return cocinaService.marcarListo(usuario.id(), id);
    }
}
