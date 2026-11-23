package com.totospizza.dto.response.seguridad;

/**
 * Dirección guardada del cliente.
 */
public record DireccionClienteResponse(
        Long id,
        String etiqueta,
        DireccionResponse direccion,
        boolean favorita
) {
}
