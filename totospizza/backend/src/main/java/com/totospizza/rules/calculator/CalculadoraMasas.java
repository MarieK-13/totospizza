package com.totospizza.rules.calculator;

import java.util.Collection;

import com.totospizza.model.entity.catalogo.PromocionItem;
import com.totospizza.model.entity.pedido.DetallePedido;

/**
 * Cuenta cuántas masas consume un pedido para descontar el "stock web exclusivo".
 * Cada pizza usa una masa; bebidas, salsas y otros productos sin tamaño no usan ninguna.
 */
public final class CalculadoraMasas {

    private CalculadoraMasas() {
    }

    public static int unidades(Collection<DetallePedido> detalles) {
        return detalles.stream().mapToInt(CalculadoraMasas::unidades).sum();
    }

    private static int unidades(DetallePedido detalle) {
        int cantidad = detalle.getCantidad();
        if (detalle.getPizzaPersonalizada() != null) {
            return cantidad;
        }
        if (detalle.getProducto() != null) {
            return detalle.getProducto().isRequiereTamano() ? cantidad : 0;
        }
        if (detalle.getPromocion() != null) {
            int pizzasPorPromocion = detalle.getPromocion().getItems().stream()
                    .filter(item -> item.getProducto().isRequiereTamano())
                    .mapToInt(PromocionItem::getCantidad)
                    .sum();
            return pizzasPorPromocion * cantidad;
        }
        return 0;
    }
}
