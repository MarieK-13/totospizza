package com.totospizza.rules.calculator;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.totospizza.dto.response.finanzas.ProductoVendidoResponse;

/**
 * Ranking de productos del menú. "Menos vendidos" parte del catálogo, no de las ventas: un producto
 * sin ninguna venta en el período es justamente el primero que el administrador quiere ver.
 */
public final class CalculadoraRanking {

    private CalculadoraRanking() {
    }

    /**
     * Productos del catálogo ordenados de menor a mayor cantidad vendida, con 0 para los que no
     * vendieron. Las ventas de pizzas personalizadas o promociones no aparecen: no son del menú.
     */
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
