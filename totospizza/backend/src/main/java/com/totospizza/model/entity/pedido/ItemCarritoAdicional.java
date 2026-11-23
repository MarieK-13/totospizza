package com.totospizza.model.entity.pedido;

import java.math.BigDecimal;

import jakarta.persistence.*;

import jakarta.validation.constraints.Min;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.totospizza.model.entity.AuditableEntity;
import com.totospizza.model.entity.catalogo.Ingrediente;

/**
 * Ingrediente adicional que el cliente agregó a una línea del carrito
 */
@Entity
@Table(
    name = "item_carrito_adicionales",
    indexes = {
        @Index(name = "idx_item_carrito_adicionales_item_carrito_id", columnList = "item_carrito_id"),
        @Index(name = "idx_item_carrito_adicionales_ingrediente_id", columnList = "ingrediente_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class ItemCarritoAdicional extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "item_carrito_id", nullable = false)
    private ItemCarrito item;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ingrediente_id", nullable = false)
    private Ingrediente ingrediente;

    @Min(1)
    @Column(name = "cantidad", nullable = false)
    private Integer cantidad = 1;

    @Column(name = "precio_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioUnitario;
}
