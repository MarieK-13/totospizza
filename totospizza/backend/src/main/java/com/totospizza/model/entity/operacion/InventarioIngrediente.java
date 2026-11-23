package com.totospizza.model.entity.operacion;

import java.math.BigDecimal;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.totospizza.model.entity.AuditableEntity;
import com.totospizza.model.entity.catalogo.Ingrediente;
import com.totospizza.model.entity.sucursal.Sucursal;
import com.totospizza.model.enums.CanalInventario;
import com.totospizza.model.enums.UnidadMedida;

/**
 * Existencias de un ingrediente en una sucursal. El inventario online y el físico se llevan por separado.
 */
@Entity
@Table(
    name = "inventario_ingredientes",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_inventario_ingrediente_sucursal_canal", columnNames = {"ingrediente_id", "sucursal_id", "canal"})
    },
    indexes = {
        @Index(name = "idx_inventario_ingredientes_sucursal_id", columnList = "sucursal_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class InventarioIngrediente extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ingrediente_id", nullable = false)
    private Ingrediente ingrediente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;

    @Enumerated(EnumType.STRING)
    @Column(name = "canal", nullable = false)
    private CanalInventario canal;

    @Column(name = "stock_actual", nullable = false, precision = 12, scale = 3)
    private BigDecimal stockActual = BigDecimal.ZERO;

    @Column(name = "stock_minimo", nullable = false, precision = 12, scale = 3)
    private BigDecimal stockMinimo = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "unidad", nullable = false)
    private UnidadMedida unidad;
}
