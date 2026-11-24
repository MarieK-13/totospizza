package com.totospizza.mapper;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.util.Comparator;

import com.totospizza.dto.response.pedido.ResumenMontosResponse;
import com.totospizza.model.entity.catalogo.Producto;
import com.totospizza.model.entity.catalogo.ProductoTamano;
import com.totospizza.model.entity.operacion.Entrega;
import com.totospizza.model.entity.operacion.InventarioIngrediente;
import com.totospizza.model.entity.pedido.Carrito;
import com.totospizza.model.entity.pedido.DetallePedido;
import com.totospizza.model.entity.pedido.ItemCarrito;
import com.totospizza.model.entity.pedido.Pedido;
import com.totospizza.model.entity.seguridad.Empleado;
import com.totospizza.model.entity.seguridad.Usuario;
import com.totospizza.rules.calculator.CalculadoraCarrito;

public final class MapeoUtils {

    private MapeoUtils() {
    }

    public static String nombreCompleto(Usuario usuario) {
        if (usuario == null) {
            return null;
        }
        return (usuario.getNombres() + " " + usuario.getApellidos()).trim();
    }

    public static String nombreEmpleado(Empleado empleado) {
        return empleado == null ? null : nombreCompleto(empleado.getUsuario());
    }

    public static String nombreMotorizado(Entrega entrega) {
        return entrega == null ? null : nombreEmpleado(entrega.getMotorizado());
    }

    /** Autor público de una reseña: nombre y la inicial del apellido ("María P."). */
    public static String autor(Usuario usuario) {
        if (usuario == null) {
            return null;
        }
        String apellidos = usuario.getApellidos();
        if (apellidos == null || apellidos.isBlank()) {
            return usuario.getNombres();
        }
        return usuario.getNombres() + " " + Character.toUpperCase(apellidos.trim().charAt(0)) + ".";
    }

    public static Integer cantidadItems(Pedido pedido) {
        return pedido.getDetalles().stream().mapToInt(DetallePedido::getCantidad).sum();
    }

    public static ResumenMontosResponse montos(Pedido pedido) {
        return new ResumenMontosResponse(pedido.getSubtotal(), pedido.getCostoDelivery(),
                pedido.getDescuento(), pedido.getTotal(), null, null);
    }

    public static String nombreItem(ItemCarrito item) {
        if (item.getProducto() != null) {
            return item.getProducto().getNombre();
        }
        if (item.getPizzaPersonalizada() != null) {
            return item.getPizzaPersonalizada().getNombre();
        }
        return item.getPromocion() == null ? null : item.getPromocion().getTitulo();
    }

    public static String descripcionItem(ItemCarrito item) {
        if (item.getProducto() != null) {
            return item.getProducto().getDescripcion();
        }
        return item.getPromocion() == null ? null : item.getPromocion().getDescripcion();
    }

    public static String imagenItem(ItemCarrito item) {
        if (item.getProducto() != null) {
            return item.getProducto().getImagenUrl();
        }
        return item.getPromocion() == null ? null : item.getPromocion().getImagenUrl();
    }

    /** Delegado: la regla de precio vive en {@link CalculadoraCarrito}. */
    public static BigDecimal subtotalItem(ItemCarrito item) {
        return CalculadoraCarrito.subtotalItem(item);
    }

    public static Integer totalItems(Carrito carrito) {
        return carrito.getItems().stream().mapToInt(ItemCarrito::getCantidad).sum();
    }

    /** Precio mínimo entre los tamaños; si el producto no usa tamaños, su precio base. */
    public static BigDecimal precioDesde(Producto producto) {
        return producto.getPrecios().stream()
                .map(ProductoTamano::getPrecio)
                .min(Comparator.naturalOrder())
                .orElse(producto.getPrecioBase());
    }

    public static boolean stockBajo(InventarioIngrediente inventario) {
        return inventario.getStockActual() != null && inventario.getStockMinimo() != null
                && inventario.getStockActual().compareTo(inventario.getStockMinimo()) <= 0;
    }

    public static Integer minutosTranscurridos(Instant desde, Instant hasta) {
        if (desde == null || hasta == null) {
            return null;
        }
        return (int) Math.max(0, Duration.between(desde, hasta).toMinutes());
    }

    /** Hora que se le prometió al cliente: confirmación del pago + minutos estimados. */
    public static Instant horaPrometida(Pedido pedido) {
        if (pedido.getConfirmadoEn() == null || pedido.getMinutosEstimados() == null) {
            return null;
        }
        return pedido.getConfirmadoEn().plus(Duration.ofMinutes(pedido.getMinutosEstimados()));
    }

    /** Promedio de estrellas con un decimal. */
    public static BigDecimal promedio(Double valor) {
        return valor == null ? BigDecimal.ZERO : BigDecimal.valueOf(valor).setScale(1, RoundingMode.HALF_UP);
    }
}
