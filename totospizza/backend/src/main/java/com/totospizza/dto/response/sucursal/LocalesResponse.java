package com.totospizza.dto.response.sucursal;

import java.util.List;

/**
 * Sucursales para la pantalla Nuestros locales.
 */
public record LocalesResponse(
        List<SucursalResponse> sucursales
) {
}
