package com.totospizza.dto.request.seguridad;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Credenciales de inicio de sesión.
 */
public record LoginRequest(
        @NotBlank @Email(message = "Correo electrónico inválido") @Size(max = 120) String correo,
        @NotBlank String contrasena
) {
}
