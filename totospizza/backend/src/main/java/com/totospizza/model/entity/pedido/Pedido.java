package com.totospizza.model.entity.pedido;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;


import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.totospizza.model.embeddable.Direccion;
import com.totospizza.model.entity.AuditableEntity;
import com.totospizza.model.entity.seguridad.Usuario;
import com.totospizza.model.entity.sucursal.Sucursal;
import com.totospizza.model.enums.EstadoPedido;
import com.totospizza.model.enums.TipoEntrega;

/**
 * Compra confirmada por un cliente. El eje del sistema: pasa por cocina, despacho y reparto.
 */
@Entity
@Table(
    name = "pedidos",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_pedidos_numero", columnNames = "numero")
    },
    indexes = {
        @Index(name = "idx_pedidos_cliente_creado", columnList = "cliente_id, creado_en"),
        @Index(name = "idx_pedidos_sucursal_estado", columnList = "sucursal_id, estado"),
        @Index(name = "idx_pedidos_estado_creado", columnList = "estado, creado_en")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class Pedido extends AuditableEntity {

    /** Número visible para el cliente, por ejemplo PZ-2847. */
    @Column(name = "numero", nullable = false)
    private String numero;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Usuario cliente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_entrega", nullable = false)
    private TipoEntrega tipoEntrega;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoPedido estado;

    /** Solo en pedidos con delivery. */
    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "direccion", column = @Column(name = "entrega_direccion")),
            @AttributeOverride(name = "referencia", column = @Column(name = "entrega_referencia")),
            @AttributeOverride(name = "distrito", column = @Column(name = "entrega_distrito")),
            @AttributeOverride(name = "latitud", column = @Column(name = "entrega_latitud")),
            @AttributeOverride(name = "longitud", column = @Column(name = "entrega_longitud"))
    })
    private Direccion direccionEntrega;

    /** Indicaciones para el repartidor. */
    @Column(name = "instrucciones", columnDefinition = "text")
    private String instrucciones;

    @Column(name = "subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "costo_delivery", nullable = false, precision = 10, scale = 2)
    private BigDecimal costoDelivery = BigDecimal.ZERO;

    @Column(name = "descuento", nullable = false, precision = 10, scale = 2)
    private BigDecimal descuento = BigDecimal.ZERO;

    @Column(name = "total", nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Column(name = "minutos_estimados")
    private Integer minutosEstimados;

    @Column(name = "confirmado_en")
    private Instant confirmadoEn;

    @Column(name = "listo_en")
    private Instant listoEn;

    @Column(name = "entregado_en")
    private Instant entregadoEn;

    @Column(name = "cancelado_en")
    private Instant canceladoEn;

    @Column(name = "motivo_cancelacion", columnDefinition = "text")
    private String motivoCancelacion;

    /** Límite para recoger en tienda (90 minutos desde que está listo). Pasado el límite, no hay reembolso. */
    @Column(name = "vencimiento_recojo")
    private Instant vencimientoRecojo;

    /** Verdadero si se aplicó la Garantía TOTO por demora. */
    @Column(name = "garantia_aplicada", nullable = false)
    private boolean garantiaAplicada = false;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetallePedido> detalles = new ArrayList<>();
}
