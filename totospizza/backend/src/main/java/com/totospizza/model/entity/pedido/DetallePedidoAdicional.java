package com.totospizza.model.entity.pedido;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.totospizza.model.entity.AuditableEntity;
import com.totospizza.model.entity.catalogo.Ingrediente;

/**
 * Ingrediente adicional de una línea del pedido, con su nombre y precio al momento de la compra.
 */
@Entity
@Table(
    name = "detalle_pedido_adicionales",
    indexes = {
        @Index(name = "idx_detalle_pedido_adicionales_detalle_pedido_id", columnList = "detalle_pedido_id"),
        @Index(name = "idx_detalle_pedido_adicionales_ingrediente_id", columnList = "ingrediente_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class DetallePedidoAdicional extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "detalle_pedido_id", nullable = false)
    private DetallePedido detalle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingrediente_id")
    private Ingrediente ingrediente;

    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Min(1)
    @Column(name = "cantidad", nullable = false)
    private Integer cantidad = 1;

    @Column(name = "precio_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioUnitario;
}
