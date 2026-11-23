package com.totospizza.repository.operacion;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.totospizza.model.entity.operacion.InventarioIngrediente;
import com.totospizza.model.enums.CanalInventario;

/**
 * Existencias de ingredientes.
 */
public interface InventarioIngredienteRepository extends JpaRepository<InventarioIngrediente, Long> {

    /** Existencia de un ingrediente en una sucursal y canal. */
    Optional<InventarioIngrediente> findByIngredienteIdAndSucursalIdAndCanal(Long ingredienteId, Long sucursalId, CanalInventario canal);

    /** Inventario de una sucursal y canal en orden alfabético. */
    @EntityGraph(attributePaths = {"ingrediente"})
    List<InventarioIngrediente> findBySucursalIdAndCanalOrderByIngredienteNombreAsc(Long sucursalId, CanalInventario canal);

    /** Ingredientes cuyo stock llegó al mínimo. Alimenta las alertas de stock bajo. */
    @EntityGraph(attributePaths = {"ingrediente"})
    @Query("""
            select i from InventarioIngrediente i
            where i.sucursal.id = :sucursalId and i.canal = :canal and i.stockActual <= i.stockMinimo
            order by i.ingrediente.nombre asc
            """)
    List<InventarioIngrediente> findStockBajo(@Param("sucursalId") Long sucursalId, @Param("canal") CanalInventario canal);

    /**
     * Descuenta stock solo si alcanza. Devuelve 1 si lo descontó y 0 si no había suficiente.
     */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("""
            update InventarioIngrediente i set i.stockActual = i.stockActual - :cantidad, i.actualizadoEn = :ahora where i.id = :id and i.stockActual >= :cantidad
            """)
    int descontarStock(@Param("id") Long id, @Param("cantidad") BigDecimal cantidad, @Param("ahora") Instant ahora);

    /** Suma stock de forma atómica (entradas y devoluciones por pedidos cancelados). */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("""
            update InventarioIngrediente i set i.stockActual = i.stockActual + :cantidad, i.actualizadoEn = :ahora
            where i.id = :id
            """)
    int reponerStock(@Param("id") Long id, @Param("cantidad") BigDecimal cantidad, @Param("ahora") Instant ahora);
}
