package com.totospizza.model.entity.sucursal;

import java.time.DayOfWeek;

import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.totospizza.model.embeddable.RangoHorario;
import com.totospizza.model.entity.AuditableEntity;

/**
 * Horario de atención de una sucursal para un día de la semana. Si cierra pasada la medianoche, la hora de fin es menor que la de inicio.
 */
@Entity
@Table(
    name = "horarios_sucursal",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_horarios_sucursal_dia", columnNames = {"sucursal_id", "dia_semana"})
    }
)
@Getter
@Setter
@NoArgsConstructor
public class HorarioSucursal extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;

    @Enumerated(EnumType.STRING)
    @Column(name = "dia_semana", nullable = false)
    private DayOfWeek diaSemana;

    @Embedded
    private RangoHorario horario;

    @Column(name = "cerrado", nullable = false)
    private boolean cerrado = false;
}
