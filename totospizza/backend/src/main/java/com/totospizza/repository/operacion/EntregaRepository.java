package com.totospizza.repository.operacion;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import jakarta.persistence.LockModeType;
import jakarta.persistence.QueryHint;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.repository.query.Param;

import com.totospizza.model.entity.operacion.Entrega;
import com.totospizza.model.enums.EstadoEntrega;
import java.time.Instant;

/**
 * Repartos de los pedidos con delivery.
 */
public interface EntregaRepository extends JpaRepository<Entrega, Long> {

    /** Entrega de un pedido con su motorizado. */
    @EntityGraph(attributePaths = {"motorizado", "motorizado.usuario"})
    Optional<Entrega> findByPedidoId(Long pedidoId);

    /**
     * Carga la entrega bloqueándola hasta terminar la transacción. 
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select e from Entrega e where e.pedido.id = :pedidoId
            """)
    Optional<Entrega> findByPedidoIdForUpdate(@Param("pedidoId") Long pedidoId);

    /** Entregas de un motorizado en ciertos estados. Para "Mis entregas". */
    @EntityGraph(attributePaths = {"pedido", "pedido.cliente"})
    List<Entrega> findByMotorizadoIdAndEstadoInOrderByAsignadaEnAsc(Long motorizadoId, Collection<EstadoEntrega> estados);

    /** Entregas completadas por un motorizado desde un instante, la más reciente primero. Para su jornada. */
    @EntityGraph(attributePaths = {"pedido", "pedido.cliente"})
    List<Entrega> findByMotorizadoIdAndEstadoAndEntregadaEnGreaterThanEqualOrderByEntregadaEnDesc(
            Long motorizadoId, EstadoEntrega estado, Instant desde);

    /** Cantidad de entregas de un motorizado en ciertos estados. */
    long countByMotorizadoIdAndEstadoIn(Long motorizadoId, Collection<EstadoEntrega> estados);

    /**
     * Reserva entregas sin asignar para que un solo proceso las tome. Salta las filas que otro
     * proceso ya bloqueó, así dos despachadores no toman la misma. 
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints(@QueryHint(name = "jakarta.persistence.lock.timeout", value = "-2"))
    @Query("""
            select e from Entrega e where e.estado = :estado order by e.creadoEn asc
            """)
    List<Entrega> reservarSinAsignar(@Param("estado") EstadoEntrega estado, Pageable pageable);

    /** Entregas completadas por un motorizado en un rango de fechas. Base del bono por entrega. */
    long countByMotorizadoIdAndEstadoAndEntregadaEnBetween(Long motorizadoId, EstadoEntrega estado,
                                                           Instant desde, Instant hasta);
}
