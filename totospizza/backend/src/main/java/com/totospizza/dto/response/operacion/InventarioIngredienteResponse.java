package com.totospizza.dto.response.operacion;

import java.math.BigDecimal;

import com.totospizza.model.enums.CanalInventario;
import com.totospizza.model.enums.UnidadMedida;

/**
 * Stock de un ingrediente por canal.
 */
public record InventarioIngredienteResponse(
        Long id,
        Long ingredienteId,
        String ingredienteNombre,
        CanalInventario canal,
        BigDecimal stockActual,
        BigDecimal stockMinimo,
        UnidadMedida unidad,
        boolean stockBajo
) {
}
