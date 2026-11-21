package com.totospizza.model.entity.finanzas;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

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
import com.totospizza.model.entity.seguridad.Empleado;
import com.totospizza.model.enums.EstadoPagoPersonal;

/**
 * Liquidación de un motorizado por un periodo: pago base más bonos por entrega.
 */
@Entity
@Table(
    name = "pagos_motorizado",
    indexes = {
        @Index(name = "idx_pagos_motorizado_empleado_periodo", columnList = "empleado_id, periodo_desde")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class PagoMotorizado extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "empleado_id", nullable = false)
    private Empleado empleado;

    @Column(name = "periodo_desde", nullable = false)
    private LocalDate periodoDesde;

    @Column(name = "periodo_hasta", nullable = false)
    private LocalDate periodoHasta;

    @Column(name = "total_entregas", nullable = false)
    private Integer totalEntregas = 0;

    @Column(name = "monto_base", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoBase;

    @Column(name = "monto_bonos", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoBonos = BigDecimal.ZERO;

    @Column(name = "monto_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoTotal;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoPagoPersonal estado;

    @Column(name = "pagado_en")
    private Instant pagadoEn;
}
