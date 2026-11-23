package com.totospizza.dto.response.configuracion;

import com.totospizza.model.enums.TipoParametro;

/**
 * Parámetro del sistema.
 */
public record ParametroSistemaResponse(
        String clave,
        String valor,
        TipoParametro tipo,
        String descripcion
) {
}
