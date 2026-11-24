package com.totospizza.repository.operacion;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.totospizza.model.entity.operacion.Turno;
import com.totospizza.model.enums.EstadoTurno;

/**
 * Turnos de trabajo.
 */
public interface TurnoRepository extends JpaRepository<Turno, Long> {

    /** Turnos de una sucursal en un día. */
    @EntityGraph(attributePaths = {"empleado", "empleado.usuario"})
    List<Turno> findBySucursalIdAndFechaOrderByHorarioHoraInicioAsc(Long sucursalId, LocalDate fecha);

    /** Turnos de un empleado entre dos fechas. */
    List<Turno> findByEmpleadoIdAndFechaBetweenOrderByFechaAsc(Long empleadoId, LocalDate desde, LocalDate hasta);

    /** Turno de un empleado en un estado, por ejemplo el que está en curso. */
    Optional<Turno> findFirstByEmpleadoIdAndEstado(Long empleadoId, EstadoTurno estado);

    /** Turnos que aún no terminan (programados o en curso) hasta una fecha. Para avanzar su estado con el reloj. */
    List<Turno> findByEstadoInAndFechaLessThanEqual(Collection<EstadoTurno> estados, LocalDate hasta);

    /** Turnos de un empleado en un estado y rango de fechas (ambos extremos incluidos). Base del pago por turno. */
    long countByEmpleadoIdAndEstadoAndFechaBetween(Long empleadoId, EstadoTurno estado,
                                                   LocalDate desde, LocalDate hasta);
}
