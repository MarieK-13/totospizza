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
 * Agrupación principal de la carta: Pizzas, Piqueos, Ensaladas, Pastas, Postres y Bebidas.
 */
@Entity
@Table(
    name = "categorias",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_categorias_nombre", columnNames = "nombre"),
        @UniqueConstraint(name = "uq_categorias_slug", columnNames = "slug")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class Categoria extends AuditableEntity {

    @NotBlank
    @Column(name = "nombre", nullable = false)
    private String nombre;

    @NotBlank
    @Column(name = "slug", nullable = false)
    private String slug;

    @Column(name = "orden", nullable = false)
    private Integer orden = 0;

    @Column(name = "activa", nullable = false)
    private boolean activa = true;
}
