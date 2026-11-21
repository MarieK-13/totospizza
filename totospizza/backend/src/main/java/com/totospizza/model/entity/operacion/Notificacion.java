package com.totospizza.model.entity.operacion;

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
import com.totospizza.model.entity.seguridad.Usuario;
import com.totospizza.model.enums.TipoNotificacion;

/**
 * Aviso para un usuario: pedido nuevo, entrega asignada, stock bajo o alerta de oferta flash.
 */
@Entity
@Table(
    name = "notificaciones",
    indexes = {
        @Index(name = "idx_notificaciones_usuario_leida", columnList = "usuario_id, leida")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class Notificacion extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false)
    private TipoNotificacion tipo;

    @NotBlank
    @Column(name = "titulo", nullable = false)
    private String titulo;

    @Column(name = "mensaje", columnDefinition = "text")
    private String mensaje;

    @Column(name = "leida", nullable = false)
    private boolean leida = false;

    @Column(name = "leida_en")
    private Instant leidaEn;
}
