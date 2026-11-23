package com.totospizza.repository.pedido;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.totospizza.model.entity.pedido.Carrito;
import com.totospizza.model.enums.EstadoCarrito;

/**
 * Carritos de los clientes.
 */
public interface CarritoRepository extends JpaRepository<Carrito, Long> {

    /** Carrito de un cliente con sus líneas. Los adicionales se cargan por lotes. */
    @EntityGraph(attributePaths = {"items", "items.producto", "items.pizzaPersonalizada", "items.promocion", "items.tamano", "items.tipoMasa"})
    Optional<Carrito> findByUsuarioIdAndEstado(Long usuarioId, EstadoCarrito estado);

    /** Carritos sin actividad desde un momento dado. Sirve para marcarlos como abandonados. */
    List<Carrito> findByEstadoAndActualizadoEnBefore(EstadoCarrito estado, Instant limite);
}
