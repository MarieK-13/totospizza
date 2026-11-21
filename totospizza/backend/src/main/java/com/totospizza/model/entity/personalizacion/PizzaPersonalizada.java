package com.totospizza.model.entity.personalizacion;

import java.math.BigDecimal;
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
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.totospizza.model.entity.AuditableEntity;
import com.totospizza.model.entity.catalogo.TamanoPizza;
import com.totospizza.model.entity.catalogo.TipoMasa;
import com.totospizza.model.entity.seguridad.Usuario;

/**
 * Pizza armada por el cliente en el asistente de 5 pasos.
 */
@Entity
@Table(
    name = "pizzas_personalizadas",
    indexes = {
        @Index(name = "idx_pizzas_personalizadas_usuario_id", columnList = "usuario_id"),
        @Index(name = "idx_pizzas_personalizadas_tamano_id", columnList = "tamano_id"),
        @Index(name = "idx_pizzas_personalizadas_tipo_masa_id", columnList = "tipo_masa_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class PizzaPersonalizada extends AuditableEntity {

    /** Puede ser nulo mientras el cliente aún no inicia sesión. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    /** Nombre que el cliente le pone, por defecto "Mi pizza". */
    @Size(max = 80)
    @Column(name = "nombre")
    private String nombre;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tamano_id", nullable = false)
    private TamanoPizza tamano;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tipo_masa_id", nullable = false)
    private TipoMasa tipoMasa;

    @Column(name = "precio_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioTotal;

    @OneToMany(mappedBy = "pizza", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PizzaPersonalizadaIngrediente> ingredientes = new ArrayList<>();
}
