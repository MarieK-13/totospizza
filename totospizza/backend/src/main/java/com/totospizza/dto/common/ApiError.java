package com.totospizza.dto.common;

import java.time.Instant;
import java.util.List;

/**
 * Formato único de error de la API. Lo produce el manejador global de excepciones.
 */
public record ApiError(
        Instant fecha,
        int estado,
        String codigo,
        String mensaje,
        String ruta,
        List<CampoError> errores
) {

    public static ApiError of(int estado, String codigo, String mensaje, String ruta) {
        return new ApiError(Instant.now(), estado, codigo, mensaje, ruta, List.of());
    }

    public static ApiError of(int estado, String codigo, String mensaje, String ruta,
                              List<CampoError> errores) {
        return new ApiError(Instant.now(), estado, codigo, mensaje, ruta, errores);
    }
}
