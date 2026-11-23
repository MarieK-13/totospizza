package com.totospizza.dto.response.operacion;

import java.util.List;

/**
 * Línea de un ticket de cocina: solo lo que hay que preparar, sin precios.
 */
public record ItemCocinaResponse(
        String nombre,
        String descripcion,
        Integer cantidad,
        String notas,
        List<String> adicionales
) {
}
