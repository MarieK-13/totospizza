package com.totospizza.model.entity.catalogo;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.totospizza.model.entity.AuditableEntity;

/**
 * Artículo de la carta: pizza, piqueo, ensalada, pasta, postre o bebida.
 */
@Entity
@Table(
    name = "productos",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_productos_slug", columnNames = "slug")
    },
    indexes = {
        @Index(name = "idx_productos_categoria_disponible", columnList = "categoria_id, disponible")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class Producto extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @NotBlank
    @Column(name = "nombre", nullable = false)
    private String nombre;

    @NotBlank
    @Column(name = "slug", nullable = false)
    private String slug;

    @Column(name = "descripcion", columnDefinition = "text")
    private String descripcion;

    @Column(name = "imagen_url")
    private String imagenUrl;

    /** Precio "desde" que se muestra en las tarjetas. */
    @Column(name = "precio_base", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioBase;

    /** Verdadero para las pizzas, que se venden por tamaño. */
    @Column(name = "requiere_tamano", nullable = false)
    private boolean requiereTamano = false;

    @Column(name = "disponible", nullable = false)
    private boolean disponible = true;

    @Column(name = "destacado", nullable = false)
    private boolean destacado = false;

    /** Promedio de estrellas, se recalcula con cada reseña. */
    @Column(name = "calificacion_promedio", nullable = false, precision = 3, scale = 2)
    private BigDecimal calificacionPromedio = BigDecimal.ZERO;

    @Column(name = "total_resenas", nullable = false)
    private Integer totalResenas = 0;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "producto_etiquetas",
            joinColumns = @JoinColumn(name = "producto_id"),
            inverseJoinColumns = @JoinColumn(name = "etiqueta_id"))
    private Set<Etiqueta> etiquetas = new HashSet<>();

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductoTamano> precios = new ArrayList<>();
}
