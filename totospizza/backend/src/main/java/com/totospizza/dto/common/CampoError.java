package com.totospizza.dto.common;

/**
 * Error de validación asociado a un campo del request.
 */
public record CampoError(
        String campo,
        String mensaje
) {
}
