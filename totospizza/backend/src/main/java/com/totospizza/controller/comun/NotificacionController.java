package com.totospizza.controller.comun;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.common.ConteoResponse;
import com.totospizza.dto.common.PageResponse;
import com.totospizza.dto.response.operacion.NotificacionResponse;
import com.totospizza.security.userdetails.UsuarioAutenticado;
import com.totospizza.service.operacion.NotificacionService;

/** Bandeja de notificaciones de cualquier usuario autenticado. */
@RestController
@RequestMapping("/api/v1/notificaciones")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class NotificacionController {

    private final NotificacionService notificacionService;

    @GetMapping
    public PageResponse<NotificacionResponse> listar(@AuthenticationPrincipal UsuarioAutenticado usuario,
                                                     @RequestParam(defaultValue = "0") int pagina,
                                                     @RequestParam(defaultValue = "20") int tamano) {
        return notificacionService.listar(usuario.id(), Paginas.de(pagina, tamano));
    }

    @GetMapping("/no-leidas/conteo")
    public ConteoResponse contarNoLeidas(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return new ConteoResponse(notificacionService.contarNoLeidas(usuario.id()));
    }

    @PatchMapping("/{id}/leida")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void marcarLeida(@AuthenticationPrincipal UsuarioAutenticado usuario, @PathVariable Long id) {
        notificacionService.marcarLeida(usuario.id(), id);
    }

    @PatchMapping("/leidas")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void marcarTodasLeidas(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        notificacionService.marcarTodasLeidas(usuario.id());
    }
}
