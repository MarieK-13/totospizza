package com.totospizza.dto.response.seguridad;

/**
 * Tokens emitidos al iniciar sesión o renovar.
 */
public record TokenResponse(
        String accessToken,
        String refreshToken,
        String tipo,
        long expiraEnSegundos,
        UsuarioResponse usuario
) {
}
