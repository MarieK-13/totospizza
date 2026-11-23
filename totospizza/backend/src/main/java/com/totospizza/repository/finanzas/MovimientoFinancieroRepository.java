package com.totospizza.repository.finanzas;

import java.math.BigDecimal;
import java.time.Instant;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.totospizza.model.entity.finanzas.MovimientoFinanciero;
import com.totospizza.model.enums.TipoMovimientoFinanciero;

/**
 * Ingresos y egresos.
 */
public interface MovimientoFinancieroRepository extends JpaRepository<MovimientoFinanciero, Long> {

    /** Movimientos recientes del periodo. Los filtros nulos se ignoran. */
    @EntityGraph(attributePaths = {"sucursal"})
    @Query(value = """
            select m from MovimientoFinanciero m
            where (:sucursalId is null or m.sucursal.id = :sucursalId)
              and m.ocurridoEn >= :desde and m.ocurridoEn < :hasta
            order by m.ocurridoEn desc
            """,
            countQuery = """
            select count(m) from MovimientoFinanciero m
            where (:sucursalId is null or m.sucursal.id = :sucursalId)
              and m.ocurridoEn >= :desde and m.ocurridoEn < :hasta
            """)
    Page<MovimientoFinanciero> findRecientes(@Param("sucursalId") Long sucursalId, @Param("desde") Instant desde, @Param("hasta") Instant hasta, Pageable pageable);

    /** Suma de ingresos o egresos del periodo. Devuelve null si no hay. */
    @Query("""
            select sum(m.monto) from MovimientoFinanciero m
            where m.tipo = :tipo and m.ocurridoEn >= :desde and m.ocurridoEn < :hasta
              and (:sucursalId is null or m.sucursal.id = :sucursalId)
            """)
    BigDecimal sumarPorTipo(@Param("tipo") TipoMovimientoFinanciero tipo, @Param("desde") Instant desde, @Param("hasta") Instant hasta, @Param("sucursalId") Long sucursalId);
}
