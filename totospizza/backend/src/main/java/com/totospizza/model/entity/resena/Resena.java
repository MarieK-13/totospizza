package com.totospizza.model.entity.resena;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.totospizza.model.entity.AuditableEntity;
import com.totospizza.model.entity.pedido.Pedido;
import com.totospizza.model.entity.seguridad.Usuario;

/**
 * Opinión de un cliente sobre un pedido. Las reseñas marcadas como destacadas aparecen en la página Nosotros.
 */
@Entity
@Table(
    name = "resenas",
    indexes = {
        @Index(name = "idx_resenas_usuario_id", columnList = "usuario_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class Resena extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id", unique = true)
    private Pedido pedido;

    @Min(1)
    @Max(5)
    @Column(name = "calificacion", nullable = false)
    private Integer calificacion;

    @Column(name = "comentario", columnDefinition = "text")
    private String comentario;

    @Column(name = "destacada", nullable = false)
    private boolean destacada = false;

    @Column(name = "visible", nullable = false)
    private boolean visible = true;

    @OneToMany(mappedBy = "resena", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CalificacionProducto> calificaciones = new ArrayList<>();
}
