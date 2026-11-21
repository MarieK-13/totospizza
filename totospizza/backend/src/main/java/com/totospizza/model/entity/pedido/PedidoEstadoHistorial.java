package com.totospizza.model.entity.pedido;

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
import com.totospizza.model.entity.seguridad.Usuario;
import com.totospizza.model.enums.EstadoPedido;

/**
 * Registro de cada cambio de estado de un pedido. Alimenta la línea de tiempo del seguimiento.
 */
@Entity
@Table(
    name = "pedido_estados_historial",
    indexes = {
        @Index(name = "idx_pedido_historial_pedido_creado", columnList = "pedido_id, creado_en"),
        @Index(name = "idx_pedido_estados_historial_cambiado_por_id", columnList = "cambiado_por_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class PedidoEstadoHistorial extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoPedido estado;

    /** Nulo cuando el cambio lo hace el sistema. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cambiado_por_id")
    private Usuario cambiadoPor;

    @Column(name = "comentario", columnDefinition = "text")
    private String comentario;
}
