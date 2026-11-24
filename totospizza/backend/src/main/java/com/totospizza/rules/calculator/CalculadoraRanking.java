package com.totospizza.rules.calculator;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.totospizza.dto.response.finanzas.ProductoVendidoResponse;

/**
 * Ranking de productos del menú. "Menos vendidos" parte del catálogo
 */
public final class CalculadoraRanking {

    private CalculadoraRanking() {
    }

    public static List<ProductoVendidoResponse> menosVendidos(List<ProductoVendidoResponse> ventas,
                                                              List<String> nombresDelMenu, int limite) {
        Map<String, ProductoVendidoResponse> porNombre = new HashMap<>();
        ventas.forEach(venta -> porNombre.put(venta.nombre(), venta));
        return nombresDelMenu.stream()
                .distinct()
                .map(nombre -> porNombre.getOrDefault(nombre, new ProductoVendidoResponse(nombre, 0, BigDecimal.ZERO)))
                .sorted(Comparator.comparingLong(ProductoVendidoResponse::cantidad)
                        .thenComparing(ProductoVendidoResponse::nombre))
                .limit(limite)
                .toList();
    }
}
