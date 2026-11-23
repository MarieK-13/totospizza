package com.totospizza.repository.pedido;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import jakarta.persistence.LockModeType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.totospizza.model.entity.pedido.Pedido;
import com.totospizza.model.enums.EstadoPedido;
import com.totospizza.model.enums.TipoEntrega;
import com.totospizza.repository.pedido.projection.PedidosPorEstado;
import com.totospizza.repository.pedido.projection.VentaDiaria;

/**
 * Acceso a los pedidos. Es la consulta más usada del sistema.
 */
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    /**
     * Siguiente número correlativo del pedido. 
     */
    @Query(value = """
            select nextval('seq_numero_pedido')
            """,
            nativeQuery = true)
    long siguienteNumero();

    /** Pedido de un cliente por su número, por ejemplo para el seguimiento. */
    @EntityGraph(attributePaths = {"sucursal"})
    Optional<Pedido> findByNumeroAndClienteId(String numero, Long clienteId);

    /** Pedido con su cliente, sucursal y líneas. Los adicionales se cargan por lotes. */
    @EntityGraph(attributePaths = {"cliente", "sucursal", "detalles"})
    @Query("""
            select p from Pedido p where p.id = :id
            """)
    Optional<Pedido> findConDetalleById(@Param("id") Long id);

    /**
     * Carga el pedido bloqueándolo hasta terminar la transacción. 
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select p from Pedido p where p.id = :id
            """)
    Optional<Pedido> findByIdForUpdate(@Param("id") Long id);

    /**
     * Historial de pedidos de un cliente. 
     */
    @EntityGraph(attributePaths = {"sucursal"})
    Page<Pedido> findByClienteId(Long clienteId, Pageable pageable);

    /**
     * Pedidos de una sucursal en ciertos estados, los más antiguos primero. 
     */
    List<Pedido> findBySucursalIdAndEstadoInOrderByConfirmadoEnAsc(Long sucursalId, Collection<EstadoPedido> estados);

    /**
     * Listado del panel de pedidos con filtros por sucursal, estado y fechas. 
     */
    @EntityGraph(attributePaths = {"cliente", "sucursal"})
    @Query(value = """
            select p from Pedido p join p.cliente c
            where (:sucursalId is null or p.sucursal.id = :sucursalId)
              and (:estado is null or p.estado = :estado)
              and p.creadoEn >= :desde and p.creadoEn < :hasta
              and (lower(p.numero) like :patron or lower(c.nombres) like :patron or lower(c.apellidos) like :patron)
            """,
            countQuery = """
            select count(p) from Pedido p join p.cliente c
            where (:sucursalId is null or p.sucursal.id = :sucursalId)
              and (:estado is null or p.estado = :estado)
              and p.creadoEn >= :desde and p.creadoEn < :hasta
              and (lower(p.numero) like :patron or lower(c.nombres) like :patron or lower(c.apellidos) like :patron)
            """)
    Page<Pedido> buscarAdmin(@Param("sucursalId") Long sucursalId, @Param("estado") EstadoPedido estado, @Param("desde") Instant desde, @Param("hasta") Instant hasta, @Param("patron") String patron, Pageable pageable);

    /** Cantidad de pedidos por estado en un periodo. */
    @Query("""
            select p.estado as estado, count(p) as cantidad from Pedido p
            where p.creadoEn >= :desde and p.creadoEn < :hasta
              and (:sucursalId is null or p.sucursal.id = :sucursalId)
            group by p.estado
            """)
    List<PedidosPorEstado> contarPorEstado(@Param("desde") Instant desde, @Param("hasta") Instant hasta, @Param("sucursalId") Long sucursalId);

    /** Suma del total de los pedidos en esos estados. Devuelve null si no hay pedidos. */
    @Query("""
            select sum(p.total) from Pedido p
            where p.estado in :estados and p.creadoEn >= :desde and p.creadoEn < :hasta
              and (:sucursalId is null or p.sucursal.id = :sucursalId)
            """)
    BigDecimal sumarVentas(@Param("estados") Collection<EstadoPedido> estados, @Param("desde") Instant desde, @Param("hasta") Instant hasta, @Param("sucursalId") Long sucursalId);

    /**
     * Pedidos y ventas por día según la hora de Lima. 
     */
    @Query(value = """
            select cast(p.creado_en at time zone 'America/Lima' as date) as fecha,
                   count(*) as pedidos,
                   sum(p.total) as total
            from pedidos p
            where p.creado_en >= :desde and p.creado_en < :hasta
              and p.estado in (:estados)
              and (cast(:sucursalId as bigint) is null or p.sucursal_id = :sucursalId)
            group by 1
            order by 1
            """,
            nativeQuery = true)
    List<VentaDiaria> ventasPorDia(@Param("desde") Instant desde, @Param("hasta") Instant hasta, @Param("estados") Collection<String> estados, @Param("sucursalId") Long sucursalId);

    /**
     * Pedidos para recojo que ya pasaron su límite de 90 minutos. Para marcarlos como no recogidos.
     */
    List<Pedido> findByEstadoAndTipoEntregaAndVencimientoRecojoBefore(EstadoPedido estado, TipoEntrega tipoEntrega, Instant ahora);

    /**
     * Pedidos en ciertos estados confirmados antes de un momento dado. Para detectar demoras y aplicar la Garantía TOTO.
     */
    List<Pedido> findByEstadoInAndConfirmadoEnBefore(Collection<EstadoPedido> estados, Instant limite);
}
