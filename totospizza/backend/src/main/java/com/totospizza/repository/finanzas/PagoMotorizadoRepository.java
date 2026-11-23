package com.totospizza.repository.finanzas;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.totospizza.model.entity.finanzas.PagoMotorizado;
import com.totospizza.model.enums.EstadoPagoPersonal;

/**
 * Liquidaciones de motorizados.
 */
public interface PagoMotorizadoRepository extends JpaRepository<PagoMotorizado, Long> {

    /** Pagos a motorizados en un estado, los más recientes primero. */
    @EntityGraph(attributePaths = {"empleado", "empleado.usuario"})
    Page<PagoMotorizado> findByEstadoOrderByPeriodoHastaDesc(EstadoPagoPersonal estado, Pageable pageable);

    /** Pagos de un motorizado. */
    List<PagoMotorizado> findByEmpleadoIdOrderByPeriodoDesdeDesc(Long empleadoId);

    /** Indica si ya se liquidó ese periodo para el motorizado. */
    boolean existsByEmpleadoIdAndPeriodoDesdeAndPeriodoHasta(Long empleadoId, LocalDate desde, LocalDate hasta);

    /** Suma de las liquidaciones en un estado. Devuelve null si no hay. */
    @Query("""
            select sum(p.montoTotal) from PagoMotorizado p where p.estado = :estado
            """)
    BigDecimal totalPorEstado(@Param("estado") EstadoPagoPersonal estado);
}
