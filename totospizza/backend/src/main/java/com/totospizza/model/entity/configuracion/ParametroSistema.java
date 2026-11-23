package com.totospizza.model.entity.configuracion;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.totospizza.model.entity.AuditableEntity;
import com.totospizza.model.enums.TipoParametro;

/**
 * Valor de configuración editable por el administrador: envío gratis desde, costo base de delivery, radio de cobertura, minutos de espera para recojo, etc.
 */
@Entity
@Table(
    name = "parametros_sistema",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_parametros_sistema_clave", columnNames = "clave")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class ParametroSistema extends AuditableEntity {

    @NotBlank
    @Column(name = "clave", nullable = false)
    private String clave;

    @NotNull
    @Column(name = "valor", nullable = false)
    private String valor;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false)
    private TipoParametro tipo;

    @Column(name = "descripcion")
    private String descripcion;
}
