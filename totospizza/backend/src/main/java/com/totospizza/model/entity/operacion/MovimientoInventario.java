package com.totospizza.model.entity.operacion;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.totospizza.model.entity.AuditableEntity;
import com.totospizza.model.entity.pedido.Pedido;
import com.totospizza.model.entity.seguridad.Usuario;
import com.totospizza.model.enums.TipoMovimientoInventario;

/**
 * Entrada, salida, ajuste o merma de un ingrediente.
 */
@Entity
@Table(
    name = "movimientos_inventario",
    indexes = {
        @Index(name = "idx_movimientos_inventario_creado", columnList = "inventario_id, creado_en"),
        @Index(name = "idx_movimientos_inventario_pedido_id", columnList = "pedido_id"),
        @Index(name = "idx_movimientos_inventario_registrado_por_id", columnList = "registrado_por_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class MovimientoInventario extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "inventario_id", nullable = false)
    private InventarioIngrediente inventario;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false)
    private TipoMovimientoInventario tipo;

    @Column(name = "cantidad", nullable = false, precision = 12, scale = 3)
    private BigDecimal cantidad;

    @Column(name = "motivo", columnDefinition = "text")
    private String motivo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id")
    private Pedido pedido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registrado_por_id")
    private Usuario registradoPor;
}
