package com.totospizza.repository.resena;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.totospizza.model.entity.resena.Resena;

/**
 * Reseñas de los pedidos.
 */
public interface ResenaRepository extends JpaRepository<Resena, Long> {

    /** Reseña de un pedido. */
    Optional<Resena> findByPedidoId(Long pedidoId);

    /** Indica si un pedido ya fue calificado. */
    boolean existsByPedidoId(Long pedidoId);

    /**
     * De una lista de pedidos, devuelve los que ya tienen reseña. 
     */
    @Query("""
            select r.pedido.id from Resena r where r.pedido.id in :pedidoIds
            """)
    List<Long> findPedidoIdsConResena(@Param("pedidoIds") Collection<Long> pedidoIds);

    /** Reseñas destacadas para la página Nosotros.*/
    @EntityGraph(attributePaths = {"usuario"})
    List<Resena> findByDestacadaTrueAndVisibleTrueOrderByCreadoEnDesc(Pageable pageable);
}
