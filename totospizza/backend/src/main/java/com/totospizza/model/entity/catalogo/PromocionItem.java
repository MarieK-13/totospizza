package com.totospizza.model.entity.catalogo;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.totospizza.model.entity.AuditableEntity;

/**
 * Producto (y cantidad) que forma parte de una promoción tipo combo.
 */
@Entity
@Table(
    name = "promocion_items",
    indexes = {
        @Index(name = "idx_promocion_items_promocion_id", columnList = "promocion_id"),
        @Index(name = "idx_promocion_items_producto_id", columnList = "producto_id"),
        @Index(name = "idx_promocion_items_tamano_id", columnList = "tamano_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class PromocionItem extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "promocion_id", nullable = false)
    private Promocion promocion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tamano_id")
    private TamanoPizza tamano;

    @Min(1)
    @Column(name = "cantidad", nullable = false)
    private Integer cantidad = 1;
}
