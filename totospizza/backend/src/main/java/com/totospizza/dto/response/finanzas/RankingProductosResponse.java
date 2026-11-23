package com.totospizza.dto.response.finanzas;

import java.util.List;

/**
 * Ranking para decidir qué actualizar en el menú.
 */
public record RankingProductosResponse(
        List<ProductoVendidoResponse> masVendidos,
        List<ProductoVendidoResponse> menosVendidos
) {
}
