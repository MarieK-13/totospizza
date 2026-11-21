package com.totospizza.model.entity.operacion;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.totospizza.model.embeddable.RangoHorario;
import com.totospizza.model.entity.AuditableEntity;
import com.totospizza.model.entity.seguridad.Empleado;
import com.totospizza.model.entity.sucursal.Sucursal;
import com.totospizza.model.enums.EstadoTurno;

/**
 * Turno de trabajo programado de un empleado en una sucursal.
 */
@Entity
@Table(
    name = "turnos",
    indexes = {
        @Index(name = "idx_turnos_sucursal_fecha", columnList = "sucursal_id, fecha"),
        @Index(name = "idx_turnos_empleado_fecha", columnList = "empleado_id, fecha")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class Turno extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "empleado_id", nullable = false)
    private Empleado empleado;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Embedded
    private RangoHorario horario;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoTurno estado;

    /** Por ejemplo "Caja principal". */
    @Column(name = "puesto")
    private String puesto;
}
