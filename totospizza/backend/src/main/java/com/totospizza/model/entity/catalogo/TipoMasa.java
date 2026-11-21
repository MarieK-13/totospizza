package com.totospizza.model.entity.catalogo;

import java.math.BigDecimal;

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
 * Tipo de masa disponible (Artesanal, Delgada, Gruesa...) con su recargo si lo tiene.
 */
@Entity
@Table(
    name = "tipos_masa",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_tipos_masa_nombre", columnNames = "nombre")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class TipoMasa extends AuditableEntity {

    @NotBlank
    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Column(name = "recargo", nullable = false, precision = 10, scale = 2)
    private BigDecimal recargo = BigDecimal.ZERO;

    @Column(name = "activa", nullable = false)
    private boolean activa = true;
}
