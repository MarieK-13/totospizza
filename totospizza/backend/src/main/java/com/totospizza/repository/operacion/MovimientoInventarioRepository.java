package com.totospizza.repository.operacion;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.totospizza.model.entity.operacion.MovimientoInventario;

/**
 * Movimientos de inventario.
 */
public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Long> {

    /** Movimientos recientes de inventario de una sucursal. */
    @EntityGraph(attributePaths = {"inventario", "inventario.ingrediente"})
    Page<MovimientoInventario> findByInventarioSucursalIdOrderByCreadoEnDesc(Long sucursalId, Pageable pageable);
}
