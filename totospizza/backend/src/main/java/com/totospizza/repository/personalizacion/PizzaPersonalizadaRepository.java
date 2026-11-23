package com.totospizza.repository.personalizacion;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.totospizza.model.entity.personalizacion.PizzaPersonalizada;

/**
 * Pizzas armadas por los clientes.
 */
public interface PizzaPersonalizadaRepository extends JpaRepository<PizzaPersonalizada, Long> {

    /** Pizza con su tamaño, masa e ingredientes elegidos. */
    @EntityGraph(attributePaths = {"tamano", "tipoMasa", "ingredientes", "ingredientes.ingrediente"})
    @Query("""
            select p from PizzaPersonalizada p where p.id = :id
            """)
    Optional<PizzaPersonalizada> findConDetalleById(@Param("id") Long id);

    /** Pizzas que armó un cliente, las más recientes primero. */
    List<PizzaPersonalizada> findByUsuarioIdOrderByCreadoEnDesc(Long usuarioId);
}
