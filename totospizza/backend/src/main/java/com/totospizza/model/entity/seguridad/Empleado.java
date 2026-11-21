package com.totospizza.model.entity.seguridad;

import java.math.BigDecimal;
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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.totospizza.model.embeddable.RangoHorario;
import com.totospizza.model.entity.AuditableEntity;
import com.totospizza.model.entity.sucursal.Sucursal;
import com.totospizza.model.enums.EstadoEmpleado;

/**
 * Datos laborales de un usuario que trabaja en una sucursal (todos los roles salvo cliente).
 */
@Entity
@Table(
    name = "empleados",
    indexes = {
        @Index(name = "idx_empleados_sucursal_estado", columnList = "sucursal_id, estado")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class Empleado extends AuditableEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoEmpleado estado;

    /** Horario habitual de trabajo. */
    @Embedded
    private RangoHorario horario;

    @Column(name = "fecha_ingreso")
    private LocalDate fechaIngreso;

    /** Solo motorizados: pago base por turno (modelo híbrido). */
    @Column(name = "pago_base_turno", precision = 10, scale = 2)
    private BigDecimal pagoBaseTurno;

    /** Solo motorizados: bono adicional por cada entrega realizada. */
    @Column(name = "bono_por_entrega", precision = 10, scale = 2)
    private BigDecimal bonoPorEntrega;
}
