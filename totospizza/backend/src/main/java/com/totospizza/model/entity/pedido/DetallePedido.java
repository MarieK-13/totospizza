package com.totospizza.model.entity.pedido;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.totospizza.model.entity.AuditableEntity;
import com.totospizza.model.entity.catalogo.Producto;
import com.totospizza.model.entity.catalogo.Promocion;
import com.totospizza.model.entity.personalizacion.PizzaPersonalizada;

/**
 * Línea de un pedido. Copia el nombre y los precios para que el pedido no cambie si luego cambia la carta.
 */
@Entity
@Table(
    name = "detalles_pedido",
    indexes = {
        @Index(name = "idx_detalles_pedido_pedido_id", columnList = "pedido_id"),
        @Index(name = "idx_detalles_pedido_producto_id", columnList = "producto_id"),
        @Index(name = "idx_detalles_pedido_pizza_personalizada_id", columnList = "pizza_personalizada_id"),
        @Index(name = "idx_detalles_pedido_promocion_id", columnList = "promocion_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class DetallePedido extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id")
    private Producto producto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pizza_personalizada_id")
    private PizzaPersonalizada pizzaPersonalizada;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promocion_id")
    private Promocion promocion;

    /** Nombre al momento de la compra. */
    @Column(name = "nombre", nullable = false)
    private String nombre;

    /** Por ejemplo "Grande · Masa artesanal". */
    @Column(name = "descripcion")
    private String descripcion;

    @Min(1)
    @Column(name = "cantidad", nullable = false)
    private Integer cantidad = 1;

    @Column(name = "precio_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioUnitario;

    @Column(name = "subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "notas", columnDefinition = "text")
    private String notas;

    @OneToMany(mappedBy = "detalle", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetallePedidoAdicional> adicionales = new ArrayList<>();
}
