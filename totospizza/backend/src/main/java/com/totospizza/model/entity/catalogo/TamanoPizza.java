package com.totospizza.model.entity.catalogo;

import java.math.BigDecimal;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.totospizza.model.entity.AuditableEntity;

/**
 * Tamaño de pizza: Personal, Mediana, Grande o Familiar, con su diámetro y para cuántas personas rinde.
 */
@Entity
@Table(
    name = "tamanos_pizza",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_tamanos_pizza_nombre", columnNames = "nombre")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class TamanoPizza extends AuditableEntity {

    @NotBlank
    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Column(name = "diametro_cm", nullable = false)
    private Integer diametroCm;

    @Column(name = "personas_min", nullable = false)
    private Integer personasMin;

    @Column(name = "personas_max", nullable = false)
    private Integer personasMax;

    /** Precio de la pizza base al personalizar. */
    @Column(name = "precio_base", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioBase;

    @Column(name = "orden", nullable = false)
    private Integer orden = 0;
}
