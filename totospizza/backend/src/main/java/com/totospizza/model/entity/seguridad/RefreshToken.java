package com.totospizza.model.entity.seguridad;

import java.time.Instant;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.totospizza.model.entity.AuditableEntity;

/**
 * Token de refresco que permite renovar la sesión sin pedir la contraseña de nuevo.
 */
@Entity
@Table(
    name = "tokens_refresco",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_tokens_refresco_hash", columnNames = "token_hash")
    },
    indexes = {
        @Index(name = "idx_tokens_refresco_usuario_id", columnList = "usuario_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class RefreshToken extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    /** Se guarda el hash del token, nunca el token. */
    @Column(name = "token_hash", nullable = false)
    private String tokenHash;

    @Column(name = "expira_en", nullable = false)
    private Instant expiraEn;

    @Column(name = "revocado", nullable = false)
    private boolean revocado = false;
}
