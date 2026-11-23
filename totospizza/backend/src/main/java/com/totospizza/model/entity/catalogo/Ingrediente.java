package com.totospizza.model.entity.catalogo;

import java.math.BigDecimal;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.totospizza.model.entity.AuditableEntity;
import com.totospizza.model.enums.TipoIngrediente;

/**
 * Insumo que se puede elegir al personalizar o agregar como adicional 
 */
@Entity
@Table(
    name = "ingredientes",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_ingredientes_nombre_tipo", columnNames = {"nombre", "tipo"})
    },
    indexes = {
        @Index(name = "idx_ingredientes_tipo_disponible", columnList = "tipo, disponible")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class Ingrediente extends AuditableEntity {

    @NotBlank
    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false)
    private TipoIngrediente tipo;

    @Column(name = "precio_extra", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioExtra;

    @Column(name = "costo_operativo_fijo", precision = 10, scale = 2)
    private BigDecimal costoOperativoFijo;

    @Column(name = "disponible", nullable = false)
    private boolean disponible = true;
}
