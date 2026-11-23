package com.totospizza.model.entity.operacion;

import java.math.BigDecimal;
import java.time.Instant;

import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.totospizza.model.entity.AuditableEntity;
import com.totospizza.model.entity.pedido.Pedido;
import com.totospizza.model.entity.seguridad.Empleado;
import com.totospizza.model.enums.EstadoEntrega;

/**
 * Seguimiento del reparto de un pedido con delivery. Se completa cuando el motorizado ingresa el código de entrega.
 */
@Entity
@Table(
    name = "entregas",
    indexes = {
        @Index(name = "idx_entregas_motorizado_estado", columnList = "motorizado_id, estado")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class Entrega extends AuditableEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pedido_id", nullable = false, unique = true)
    private Pedido pedido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "motorizado_id")
    private Empleado motorizado;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoEntrega estado;

    @Pattern(regexp = "\\d{4}")
    @Column(name = "codigo_pin", nullable = false)
    private String codigoPin;

    @Column(name = "intentos_fallidos", nullable = false)
    private Integer intentosFallidos = 0;

    @Column(name = "asignada_en")
    private Instant asignadaEn;

    @Column(name = "recogida_en")
    private Instant recogidaEn;

    @Column(name = "entregada_en")
    private Instant entregadaEn;

    @Column(name = "distancia_km", precision = 5, scale = 2)
    private BigDecimal distanciaKm;
}
