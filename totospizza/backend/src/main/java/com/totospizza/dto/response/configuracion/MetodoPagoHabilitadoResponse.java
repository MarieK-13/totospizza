package com.totospizza.dto.response.configuracion;

import com.totospizza.model.enums.MetodoPago;

/**
 * Método de pago y su estado.
 */
public record MetodoPagoHabilitadoResponse(
        MetodoPago metodo,
        String etiqueta,
        boolean activo,
        Integer orden
) {
}
