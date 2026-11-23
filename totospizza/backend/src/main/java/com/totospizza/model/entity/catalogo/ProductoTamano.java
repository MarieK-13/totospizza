package com.totospizza.model.entity.catalogo;

import java.math.BigDecimal;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.totospizza.model.entity.AuditableEntity;

/**
 * Precio de un producto para un tamaño concreto.
 */
@Entity
@Table(
    name = "producto_tamanos",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_producto_tamanos", columnNames = {"producto_id", "tamano_id"})
    },
    indexes = {
        @Index(name = "idx_producto_tamanos_tamano_id", columnList = "tamano_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class ProductoTamano extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tamano_id", nullable = false)
    private TamanoPizza tamano;

    @Column(name = "precio", nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;
}
