package com.totospizza.model.entity.resena;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.totospizza.model.entity.AuditableEntity;
import com.totospizza.model.entity.catalogo.Producto;

/**
 * Estrellas que un cliente le puso a un producto dentro de una reseña.
 */
@Entity
@Table(
    name = "calificaciones_producto",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_calificaciones_resena_producto", columnNames = {"resena_id", "producto_id"})
    },
    indexes = {
        @Index(name = "idx_calificaciones_producto_producto_id", columnList = "producto_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class CalificacionProducto extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resena_id", nullable = false)
    private Resena resena;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @Min(1)
    @Max(5)
    @Column(name = "estrellas", nullable = false)
    private Integer estrellas;
}
