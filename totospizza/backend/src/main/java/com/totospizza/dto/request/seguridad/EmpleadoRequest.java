package com.totospizza.dto.request.seguridad;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import com.totospizza.model.enums.Rol;
import com.totospizza.model.enums.TipoDocumento;

/**
 * Alta o edición de un empleado (solo administrador).
 */
public record EmpleadoRequest(
        @NotBlank @Size(max = 80) String nombres,
        @NotBlank @Size(max = 80) String apellidos,
        @NotNull TipoDocumento tipoDocumento,
        @NotBlank
        @Pattern(regexp = "^[A-Za-z0-9]{8,20}$", message = "El documento debe tener entre 8 y 20 caracteres alfanuméricos")
        String numeroDocumento,
        @NotBlank
        @Pattern(regexp = "^9\\d{8}$", message = "El celular debe tener 9 dígitos y empezar con 9")
        String telefono,
        @NotBlank @Email(message = "Correo electrónico inválido") @Size(max = 120) String correo,
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).{8,72}$", message = "La contraseña debe tener entre 8 y 72 caracteres, con letras y números")
        String contrasenaInicial,
        @NotNull Rol rol,
        @NotNull @Positive Long sucursalId,
        @NotNull LocalTime horaInicio,
        @NotNull LocalTime horaFin,
        @NotNull @PastOrPresent LocalDate fechaIngreso,
        @DecimalMin(value = "0.00") @Digits(integer = 8, fraction = 2) BigDecimal pagoBaseTurno,
        @DecimalMin(value = "0.00") @Digits(integer = 8, fraction = 2) BigDecimal bonoPorEntrega
) {
}
