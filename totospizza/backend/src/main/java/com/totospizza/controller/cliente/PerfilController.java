package com.totospizza.controller.cliente;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.request.seguridad.ActualizarPerfilRequest;
import com.totospizza.dto.request.seguridad.DireccionClienteRequest;
import com.totospizza.dto.response.seguridad.DireccionClienteResponse;
import com.totospizza.dto.response.seguridad.PerfilResponse;
import com.totospizza.security.userdetails.UsuarioAutenticado;
import com.totospizza.service.seguridad.PerfilService;

/** Perfil y libreta de direcciones del cliente. */
@RestController
@RequestMapping("/api/v1/cliente")
@PreAuthorize("hasRole('CLIENTE')")
@RequiredArgsConstructor
public class PerfilController {

    private final PerfilService perfilService;

    @GetMapping("/perfil")
    public PerfilResponse perfil(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return perfilService.obtener(usuario.id());
    }

    @PutMapping("/perfil")
    public PerfilResponse actualizarPerfil(@AuthenticationPrincipal UsuarioAutenticado usuario,
                                           @Valid @RequestBody ActualizarPerfilRequest request) {
        return perfilService.actualizar(usuario.id(), request);
    }

    @GetMapping("/direcciones")
    public List<DireccionClienteResponse> direcciones(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return perfilService.listarDirecciones(usuario.id());
    }

    @PostMapping("/direcciones")
    @ResponseStatus(HttpStatus.CREATED)
    public DireccionClienteResponse agregarDireccion(@AuthenticationPrincipal UsuarioAutenticado usuario,
                                                     @Valid @RequestBody DireccionClienteRequest request) {
        return perfilService.agregarDireccion(usuario.id(), request);
    }

    @PutMapping("/direcciones/{id}")
    public DireccionClienteResponse actualizarDireccion(@AuthenticationPrincipal UsuarioAutenticado usuario,
                                                        @PathVariable Long id,
                                                        @Valid @RequestBody DireccionClienteRequest request) {
        return perfilService.actualizarDireccion(usuario.id(), id, request);
    }

    @DeleteMapping("/direcciones/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminarDireccion(@AuthenticationPrincipal UsuarioAutenticado usuario, @PathVariable Long id) {
        perfilService.eliminarDireccion(usuario.id(), id);
    }
}
