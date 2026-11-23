package com.totospizza.model.entity.seguridad;

import jakarta.persistence.*;

import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.totospizza.model.embeddable.Direccion;
import com.totospizza.model.entity.AuditableEntity;

/**
 * Dirección guardada por un cliente. Una de ellas puede ser la dirección favorita.
 */
@Entity
@Table(
    name = "direcciones_cliente",
    indexes = {
        @Index(name = "idx_direcciones_cliente_usuario_id", columnList = "usuario_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class DireccionCliente extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    /** Nombre corto, por ejemplo Casa o Trabajo. */
    @Size(max = 50)
    @Column(name = "etiqueta")
    private String etiqueta;

    @Embedded
    private Direccion direccion;

    @Column(name = "favorita", nullable = false)
    private boolean favorita = false;
}
