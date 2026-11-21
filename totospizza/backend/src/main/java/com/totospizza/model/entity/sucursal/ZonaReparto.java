package com.totospizza.model.entity.sucursal;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.totospizza.model.entity.AuditableEntity;

/**
 * Anillo de distancia alrededor de una sucursal con su costo de envío (tarifa dinámica por distancia).
 */
@Entity
@Table(
    name = "zonas_reparto",
    indexes = {
        @Index(name = "idx_zonas_reparto_sucursal_activa", columnList = "sucursal_id, activa")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class ZonaReparto extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;

    @NotBlank
    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Column(name = "distancia_desde_km", nullable = false, precision = 4, scale = 1)
    private BigDecimal distanciaDesdeKm;

    @Column(name = "distancia_hasta_km", nullable = false, precision = 4, scale = 1)
    private BigDecimal distanciaHastaKm;

    @Column(name = "costo_envio", nullable = false, precision = 10, scale = 2)
    private BigDecimal costoEnvio;

    @Column(name = "activa", nullable = false)
    private boolean activa = true;
}
