package com.totospizza.model.entity.pedido;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;

import jakarta.validation.constraints.Min;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.totospizza.model.entity.AuditableEntity;
import com.totospizza.model.entity.catalogo.Producto;
import com.totospizza.model.entity.catalogo.Promocion;
import com.totospizza.model.entity.catalogo.TamanoPizza;
import com.totospizza.model.entity.catalogo.TipoMasa;
import com.totospizza.model.entity.personalizacion.PizzaPersonalizada;

/**
 * Línea del carrito. Contiene un producto, una pizza personalizada o una promoción (solo uno de los tres).
 */
@Entity
@Table(
    name = "items_carrito",
    indexes = {
        @Index(name = "idx_items_carrito_carrito_id", columnList = "carrito_id"),
        @Index(name = "idx_items_carrito_producto_id", columnList = "producto_id"),
        @Index(name = "idx_items_carrito_pizza_personalizada_id", columnList = "pizza_personalizada_id"),
        @Index(name = "idx_items_carrito_promocion_id", columnList = "promocion_id"),
        @Index(name = "idx_items_carrito_tamano_id", columnList = "tamano_id"),
        @Index(name = "idx_items_carrito_tipo_masa_id", columnList = "tipo_masa_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class ItemCarrito extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "carrito_id", nullable = false)
    private Carrito carrito;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id")
    private Producto producto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pizza_personalizada_id")
    private PizzaPersonalizada pizzaPersonalizada;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promocion_id")
    private Promocion promocion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tamano_id")
    private TamanoPizza tamano;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_masa_id")
    private TipoMasa tipoMasa;

    @Min(1)
    @Column(name = "cantidad", nullable = false)
    private Integer cantidad = 1;

    @Column(name = "precio_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioUnitario;

    @Column(name = "notas", columnDefinition = "text")
    private String notas;

    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemCarritoAdicional> adicionales = new ArrayList<>();
}
