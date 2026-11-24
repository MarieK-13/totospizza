package com.totospizza.service.seguridad;

import com.totospizza.dto.request.seguridad.CambiarContrasenaRequest;
import com.totospizza.dto.request.seguridad.LoginRequest;
import com.totospizza.dto.request.seguridad.OlvidoContrasenaRequest;
import com.totospizza.dto.request.seguridad.RefreshTokenRequest;
import com.totospizza.dto.request.seguridad.RegistroRequest;
import com.totospizza.dto.request.seguridad.RestablecerContrasenaRequest;
import com.totospizza.dto.response.seguridad.TokenResponse;

/**
 * Registro, inicio de sesión y manejo de contraseñas. Los refresh tokens rotan en cada uso
 */
public interface AuthService {

    TokenResponse registrar(RegistroRequest request);

    TokenResponse login(LoginRequest request);

    TokenResponse renovar(RefreshTokenRequest request);

    void cerrarSesion(Long usuarioId);

    void solicitarRecuperacion(OlvidoContrasenaRequest request);

    void restablecerContrasena(RestablecerContrasenaRequest request);

    void cambiarContrasena(Long usuarioId, CambiarContrasenaRequest request);
}
