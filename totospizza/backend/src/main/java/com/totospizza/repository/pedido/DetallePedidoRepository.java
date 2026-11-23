package com.totospizza.repository.pedido;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.totospizza.model.entity.pedido.DetallePedido;
import com.totospizza.model.enums.EstadoPedido;
import com.totospizza.repository.pedido.projection.ProductoMasVendido;

/**
 * Líneas de los pedidos.
 */
public interface DetallePedidoRepository extends JpaRepository<DetallePedido, Long> {

    /** Líneas de un pedido del cliente. Para "Pedir de nuevo". */
    List<DetallePedido> findByPedidoIdAndPedidoClienteId(Long pedidoId, Long clienteId);

    /**
     * Productos más vendidos por ingresos.
     */
    @Query("""
            select d.nombre as nombre, sum(d.cantidad) as cantidad, sum(d.subtotal) as ingresos
            from DetallePedido d join d.pedido p
            where p.estado in :estados and p.creadoEn >= :desde and p.creadoEn < :hasta
              and (:sucursalId is null or p.sucursal.id = :sucursalId)
            group by d.nombre
            order by sum(d.subtotal) desc
            """)
    List<ProductoMasVendido> masVendidos(@Param("estados") Collection<EstadoPedido> estados, @Param("desde") Instant desde, @Param("hasta") Instant hasta, @Param("sucursalId") Long sucursalId, Pageable pageable);
}
