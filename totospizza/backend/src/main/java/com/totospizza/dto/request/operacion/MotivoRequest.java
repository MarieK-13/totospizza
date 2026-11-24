package com.totospizza.dto.request.operacion;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Motivo de una acción del personal que queda en el historial del pedido
 * (entrega fallida, entrega confirmada sin PIN…).
 */
public record MotivoRequest(
        @NotBlank @Size(max = 200) String motivo
) {
}
