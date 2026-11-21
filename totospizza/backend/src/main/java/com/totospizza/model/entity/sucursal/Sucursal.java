package com.totospizza.model.entity.sucursal;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.totospizza.model.embeddable.Direccion;
import com.totospizza.model.entity.AuditableEntity;

/**
 * Local físico de Toto's Pizza con su dirección, horarios y zona de cobertura.
 */
@Entity
@Table(
    name = "sucursales",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_sucursales_nombre", columnNames = "nombre")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class Sucursal extends AuditableEntity {

    @NotBlank
    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Embedded
    private Direccion direccion;

    @Size(max = 20)
    @Column(name = "telefono")
    private String telefono;

    @Column(name = "imagen_url")
    private String imagenUrl;

    @Column(name = "activa", nullable = false)
    private boolean activa = true;

    /** Radio de reparto en kilómetros. */
    @Column(name = "radio_cobertura_km", nullable = false, precision = 4, scale = 1)
    private BigDecimal radioCoberturaKm = new BigDecimal("3.5");

    @OneToMany(mappedBy = "sucursal", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HorarioSucursal> horarios = new ArrayList<>();

    @OneToMany(mappedBy = "sucursal", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ZonaReparto> zonas = new ArrayList<>();
}
