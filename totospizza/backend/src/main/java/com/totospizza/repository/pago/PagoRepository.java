package com.totospizza.repository.pago;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.totospizza.model.entity.pago.Pago;
import com.totospizza.model.enums.EstadoPago;
import com.totospizza.repository.pago.projection.VentaPorMetodoPago;

/**
 * Pagos de los pedidos.
 */
public interface PagoRepository extends JpaRepository<Pago, Long> {

    /** Pagos de un pedido, el más reciente primero. */
    List<Pago> findByPedidoIdOrderByCreadoEnDesc(Long pedidoId);

    /** Último pago de un pedido en un estado, por ejemplo el aprobado que se va a reembolsar. */
    Optional<Pago> findFirstByPedidoIdAndEstadoOrderByPagadoEnDesc(Long pedidoId, EstadoPago estado);

    /** Busca un pago por el identificador de la pasarela. */
    Optional<Pago> findByReferenciaExterna(String referenciaExterna);

    Optional<Pago> findByReferenciaIntento(String referenciaIntento);

    /**
     * Pagos en un estado creados antes de un momento dado. Para conciliar los cobros que quedaron sin respuesta.
     */
    List<Pago> findByEstadoAndCreadoEnBefore(EstadoPago estado, Instant limite);

    /** Cantidad y monto cobrado por método de pago en un periodo. */
    @Query("""
            select p.metodo as metodo, count(p) as cantidad, sum(p.monto) as total from Pago p
            where p.estado = :estado and p.pagadoEn >= :desde and p.pagadoEn < :hasta
              and (:sucursalId is null or p.pedido.sucursal.id = :sucursalId)
            group by p.metodo
            """)
    List<VentaPorMetodoPago> resumenPorMetodo(@Param("estado") EstadoPago estado, @Param("desde") Instant desde, @Param("hasta") Instant hasta, @Param("sucursalId") Long sucursalId);
}
