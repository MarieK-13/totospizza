package com.totospizza.dto.request.seguridad;

import jakarta.validation.constraints.NotBlank;

/**
 * Solicitud para renovar el access token.
 */
public record RefreshTokenRequest(
        @NotBlank String refreshToken
) {
}
