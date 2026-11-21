package com.totospizza.model.entity.finanzas;

import java.math.BigDecimal;
import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.totospizza.model.entity.AuditableEntity;
import com.totospizza.model.entity.pago.Pago;
import com.totospizza.model.entity.pedido.Pedido;
import com.totospizza.model.entity.seguridad.Usuario;
import com.totospizza.model.entity.sucursal.Sucursal;
import com.totospizza.model.enums.TipoMovimientoFinanciero;

/**
 * Ingreso o egreso de dinero de una sucursal. Alimenta el panel de finanzas.
 */
@Entity
@Table(
    name = "movimientos_financieros",
    indexes = {
        @Index(name = "idx_movimientos_financieros_sucursal_ocurrido", columnList = "sucursal_id, ocurrido_en"),
        @Index(name = "idx_movimientos_financieros_pedido_id", columnList = "pedido_id"),
        @Index(name = "idx_movimientos_financieros_pago_id", columnList = "pago_id"),
        @Index(name = "idx_movimientos_financieros_registrado_por_id", columnList = "registrado_por_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class MovimientoFinanciero extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false)
    private TipoMovimientoFinanciero tipo;

    @NotBlank
    @Column(name = "concepto", nullable = false)
    private String concepto;

    @Column(name = "monto", nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id")
    private Pedido pedido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pago_id")
    private Pago pago;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registrado_por_id")
    private Usuario registradoPor;

    @Column(name = "ocurrido_en", nullable = false)
    private Instant ocurridoEn;
}
