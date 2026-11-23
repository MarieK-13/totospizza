package com.totospizza.model.entity.pago;

import java.math.BigDecimal;
import java.time.Instant;

import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.totospizza.model.entity.AuditableEntity;
import com.totospizza.model.entity.pedido.Pedido;
import com.totospizza.model.enums.EstadoPago;
import com.totospizza.model.enums.MetodoPago;

/**
 * Intento de cobro de un pedido. Nunca se guarda el número completo de la tarjeta ni el CVV.
 */
@Entity
@Table(
    name = "pagos",
    indexes = {
        @Index(name = "idx_pagos_estado_pagado", columnList = "estado, pagado_en"),
        @Index(name = "idx_pagos_pedido_id", columnList = "pedido_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class Pago extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo", nullable = false)
    private MetodoPago metodo;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoPago estado;

    @Column(name = "monto", nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;

    /** Identificador de la operación en la pasarela de pago. */
    @Column(name = "referencia_externa")
    private String referenciaExterna;

    /** Solo los 4 últimos dígitos de la tarjeta. */
    @Pattern(regexp = "\\d{4}")
    @Column(name = "ultimos_digitos")
    private String ultimosDigitos;

    @Column(name = "marca_tarjeta")
    private String marcaTarjeta;

    @Column(name = "pagado_en")
    private Instant pagadoEn;

    @Column(name = "reembolsado_en")
    private Instant reembolsadoEn;

    @Column(name = "monto_reembolsado", precision = 10, scale = 2)
    private BigDecimal montoReembolsado;

    @Column(name = "motivo_reembolso", columnDefinition = "text")
    private String motivoReembolso;
}
