package com.totospizza.dto.request.seguridad;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Solicitud de enlace para recuperar la contraseña.
 */
public record OlvidoContrasenaRequest(
        @NotBlank @Email(message = "Correo electrónico inválido") @Size(max = 120) String correo
) {
}
