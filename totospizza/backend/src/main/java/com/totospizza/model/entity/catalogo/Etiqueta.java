package com.totospizza.model.entity.catalogo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.totospizza.model.entity.AuditableEntity;

/**
 * Marca que se asigna a un producto. Algunas sirven de filtro del menú (Clásicas, Especiales, Vegetarianas) y otras son insignias (Popular, Nuevo, Hot).
 */
@Entity
@Table(
    name = "etiquetas",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_etiquetas_nombre", columnNames = "nombre"),
        @UniqueConstraint(name = "uq_etiquetas_slug", columnNames = "slug")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class Etiqueta extends AuditableEntity {

    @NotBlank
    @Column(name = "nombre", nullable = false)
    private String nombre;

    @NotBlank
    @Column(name = "slug", nullable = false)
    private String slug;

    /** Verdadero si aparece como chip de filtro en el menú. */
    @Column(name = "es_filtro", nullable = false)
    private boolean esFiltro = false;
}
