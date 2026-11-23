package com.totospizza.controller.auth;

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

import com.totospizza.dto.common.MensajeResponse;
import com.totospizza.dto.request.seguridad.CambiarContrasenaRequest;
import com.totospizza.dto.request.seguridad.LoginRequest;
import com.totospizza.dto.request.seguridad.OlvidoContrasenaRequest;
import com.totospizza.dto.request.seguridad.RefreshTokenRequest;
import com.totospizza.dto.request.seguridad.RegistroRequest;
import com.totospizza.dto.request.seguridad.RestablecerContrasenaRequest;
import com.totospizza.dto.response.seguridad.TokenResponse;
import com.totospizza.security.userdetails.UsuarioAutenticado;
import com.totospizza.service.seguridad.AuthService;

/** Registro, sesión y recuperación de contraseña. */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/registro")
    @ResponseStatus(HttpStatus.CREATED)
    public TokenResponse registrar(@Valid @RequestBody RegistroRequest request) {
        return authService.registrar(request);
    }

    @PostMapping("/login")
    public TokenResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/refresh")
    public TokenResponse renovar(@Valid @RequestBody RefreshTokenRequest request) {
        return authService.renovar(request);
    }

    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cerrarSesion(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        authService.cerrarSesion(usuario.id());
    }

    @PostMapping("/olvido-contrasena")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public MensajeResponse olvidoContrasena(@Valid @RequestBody OlvidoContrasenaRequest request) {
        authService.solicitarRecuperacion(request);
        return MensajeResponse.of("Si el correo está registrado, te enviamos las instrucciones");
    }

    @PostMapping("/restablecer-contrasena")
    public MensajeResponse restablecerContrasena(@Valid @RequestBody RestablecerContrasenaRequest request) {
        authService.restablecerContrasena(request);
        return MensajeResponse.of("Contraseña actualizada. Ya puedes iniciar sesión");
    }

    @PostMapping("/cambiar-contrasena")
    @PreAuthorize("isAuthenticated()")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cambiarContrasena(@AuthenticationPrincipal UsuarioAutenticado usuario,
                                  @Valid @RequestBody CambiarContrasenaRequest request) {
        authService.cambiarContrasena(usuario.id(), request);
    }
}
