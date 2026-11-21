package com.totospizza.model.entity.catalogo;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.totospizza.model.entity.AuditableEntity;
import com.totospizza.model.enums.TipoIngrediente;

/**
 * Insumo que se puede elegir al personalizar o agregar como adicional: quesos, salsas, carnes y otros ingredientes.
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

    /** Precio que paga el cliente al agregarlo. */
    @Column(name = "precio_extra", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioExtra;

    /** Solo ingredientes menores. Los mayores se costean con receta (pendiente, Fase 2). */
    @Column(name = "costo_operativo_fijo", precision = 10, scale = 2)
    private BigDecimal costoOperativoFijo;

    @Column(name = "disponible", nullable = false)
    private boolean disponible = true;
}
