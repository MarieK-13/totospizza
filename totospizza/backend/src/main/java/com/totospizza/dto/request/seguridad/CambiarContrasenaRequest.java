package com.totospizza.dto.request.seguridad;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * Cambio de contraseña de un usuario autenticado.
 */
public record CambiarContrasenaRequest(
        @NotBlank String contrasenaActual,
        @NotBlank
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).{8,72}$", message = "La contraseña debe tener entre 8 y 72 caracteres, con letras y números")
        String nuevaContrasena,
        @NotBlank String confirmarContrasena
) {
}
