package com.totospizza.service.seguridad;

import com.totospizza.dto.request.seguridad.CambiarContrasenaRequest;
import com.totospizza.dto.request.seguridad.LoginRequest;
import com.totospizza.dto.request.seguridad.OlvidoContrasenaRequest;
import com.totospizza.dto.request.seguridad.RefreshTokenRequest;
import com.totospizza.dto.request.seguridad.RegistroRequest;
import com.totospizza.dto.request.seguridad.RestablecerContrasenaRequest;
import com.totospizza.dto.response.seguridad.TokenResponse;

/**
 * Registro, inicio de sesión y manejo de contraseñas. Los refresh tokens rotan en cada uso:
 * si alguien presenta uno ya usado, se revocan todas las sesiones de ese usuario.
 */
public interface AuthService {

    /** Crea una cuenta de cliente y la deja con la sesión iniciada. */
    TokenResponse registrar(RegistroRequest request);

    TokenResponse login(LoginRequest request);

    /** Cambia un refresh token vigente por un par de tokens nuevo. */
    TokenResponse renovar(RefreshTokenRequest request);

    /** Revoca todas las sesiones del usuario. */
    void cerrarSesion(Long usuarioId);

    /** Envía el enlace de recuperación. Responde igual exista o no el correo, para no revelar cuentas. */
    void solicitarRecuperacion(OlvidoContrasenaRequest request);

    void restablecerContrasena(RestablecerContrasenaRequest request);

    void cambiarContrasena(Long usuarioId, CambiarContrasenaRequest request);
}
