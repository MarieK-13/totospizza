package com.totospizza.dto.request.seguridad;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * Restablece la contraseña con el token recibido por correo.
 */
public record RestablecerContrasenaRequest(
        @NotBlank String token,
        @NotBlank
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).{8,72}$", message = "La contraseña debe tener entre 8 y 72 caracteres, con letras y números")
        String nuevaContrasena,
        @NotBlank String confirmarContrasena
) {
}
