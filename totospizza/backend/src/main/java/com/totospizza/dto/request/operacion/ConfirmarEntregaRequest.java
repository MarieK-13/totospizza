package com.totospizza.dto.request.operacion;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * El motorizado confirma la entrega con el código de 4 dígitos del cliente.
 */
public record ConfirmarEntregaRequest(
        @NotBlank @Pattern(regexp = "^\\d{4}$", message = "El código debe tener 4 dígitos") String codigoPin
) {
}
