package com.totospizza.model.entity.personalizacion;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.totospizza.model.entity.AuditableEntity;
import com.totospizza.model.entity.catalogo.Ingrediente;
import com.totospizza.model.enums.PasoPersonalizacion;

/**
 * Ingrediente elegido para una pizza personalizada, con el precio que se aplicó.
 */
@Entity
@Table(
    name = "pizza_personalizada_ingredientes",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_pizza_personalizada_ingrediente", columnNames = {"pizza_id", "ingrediente_id"})
    },
    indexes = {
        @Index(name = "idx_pizza_personalizada_ingredientes_ingrediente_id", columnList = "ingrediente_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class PizzaPersonalizadaIngrediente extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pizza_id", nullable = false)
    private PizzaPersonalizada pizza;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ingrediente_id", nullable = false)
    private Ingrediente ingrediente;

    /** Paso del asistente en el que se eligió: queso, salsa o ingredientes. */
    @Enumerated(EnumType.STRING)
    @Column(name = "paso", nullable = false)
    private PasoPersonalizacion paso;

    @Column(name = "precio_aplicado", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioAplicado;
}
