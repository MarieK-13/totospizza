package com.totospizza.rules.calculator;

import java.math.BigDecimal;

import com.totospizza.model.entity.pedido.ItemCarrito;
import com.totospizza.model.entity.pedido.ItemCarritoAdicional;

/**
 * Precios de una línea del carrito. El precio unitario NO incluye los adicionales:
 * subtotal = (precio unitario + suma de adicionales por unidad) x cantidad.
 */
public final class CalculadoraCarrito {

    private CalculadoraCarrito() {
    }

    public static BigDecimal subtotalItem(ItemCarrito item) {
        BigDecimal adicionales = item.getAdicionales().stream()
                .map(CalculadoraCarrito::subtotalAdicional)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return item.getPrecioUnitario().add(adicionales).multiply(BigDecimal.valueOf(item.getCantidad()));
    }

    public static BigDecimal subtotal(Iterable<ItemCarrito> items) {
        BigDecimal total = BigDecimal.ZERO;
        for (ItemCarrito item : items) {
            total = total.add(subtotalItem(item));
        }
        return total;
    }

    private static BigDecimal subtotalAdicional(ItemCarritoAdicional adicional) {
        return adicional.getPrecioUnitario().multiply(BigDecimal.valueOf(adicional.getCantidad()));
    }
}
