package com.totospizza.repository.resena;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.totospizza.model.entity.resena.CalificacionProducto;
import com.totospizza.repository.resena.projection.ResumenCalificacion;

/**
 * Estrellas de los productos.
 */
public interface CalificacionProductoRepository extends JpaRepository<CalificacionProducto, Long> {

    /**
     * Promedio y total de calificaciones de un producto. 
     */
    @Query("""
            select avg(c.estrellas) as promedio, count(c) as total from CalificacionProducto c where c.producto.id = :productoId
            """)
    ResumenCalificacion resumenDeProducto(@Param("productoId") Long productoId);
}
