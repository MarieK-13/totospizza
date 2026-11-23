package com.totospizza.dto.request.pago;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import com.totospizza.model.enums.MetodoPago;

/**
 * Datos de pago. Nunca se envía el número de tarjeta ni el CVV: solo el token de la pasarela.
 */
public record PagoRequest(
        @NotNull MetodoPago metodo,
        @Size(max = 200) String tokenTarjeta,
        @Pattern(regexp = "^9\\d{8}$", message = "El celular debe tener 9 dígitos y empezar con 9")
        String telefonoBilletera
) {
}
