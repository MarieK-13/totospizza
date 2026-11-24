package com.totospizza.repository.pedido;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.totospizza.model.entity.pedido.PedidoEstadoHistorial;

/**
 * Historial de estados de los pedidos.
 */
public interface PedidoEstadoHistorialRepository extends JpaRepository<PedidoEstadoHistorial, Long> {

    /** Cambios de estado de un pedido en orden. Para la línea de tiempo del seguimiento. */
    @EntityGraph(attributePaths = {"cambiadoPor"})
    List<PedidoEstadoHistorial> findByPedidoIdOrderByCreadoEnAsc(Long pedidoId);

    /** Cambios de estado de varios pedidos a la vez, en orden. Para saber cuándo entró cada uno a su estado actual. */
    List<PedidoEstadoHistorial> findByPedidoIdInOrderByCreadoEnAsc(Collection<Long> pedidoIds);
}
