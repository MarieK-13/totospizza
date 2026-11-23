package com.totospizza.repository.pedido.projection;

import java.math.BigDecimal;

/**
 * Producto con su cantidad vendida e ingresos. Alimenta "Pizzas más vendidas" y "Mayor ingreso por pizza".
 */
public interface ProductoMasVendido {

    String getNombre();
    Long getCantidad();
    BigDecimal getIngresos();
}
