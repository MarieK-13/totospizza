package com.totospizza.dto.request.seguridad;

import java.time.LocalDate;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import com.totospizza.model.enums.TipoDocumento;

/**
 * Datos para registrar un nuevo cliente.
 */
public record RegistroRequest(
        // Nombres del cliente
        @NotBlank @Size(max = 80) String nombres,
        @NotBlank @Size(max = 80) String apellidos,
        @NotNull TipoDocumento tipoDocumento,
        @NotBlank
        @Pattern(regexp = "^[A-Za-z0-9]{8,20}$", message = "El documento debe tener entre 8 y 20 caracteres alfanuméricos")
        String numeroDocumento,
        @NotNull @Past(message = "La fecha de nacimiento debe ser pasada") LocalDate fechaNacimiento,
        @NotBlank
        @Pattern(regexp = "^9\\d{8}$", message = "El celular debe tener 9 dígitos y empezar con 9")
        String telefono,
        @NotBlank @Email(message = "Correo electrónico inválido") @Size(max = 120) String correo,
        @NotBlank
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).{8,72}$", message = "La contraseña debe tener entre 8 y 72 caracteres, con letras y números")
        String contrasena,
        @NotBlank String confirmarContrasena,
        @AssertTrue(message = "Debes aceptar los términos y condiciones") boolean aceptaTerminos
) {
}
