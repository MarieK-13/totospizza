package com.totospizza.repository.catalogo;

import java.time.Instant;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.totospizza.model.entity.catalogo.Promocion;
import com.totospizza.model.enums.TipoPromocion;

/**
 * Promociones del banner del Home.
 */
public interface PromocionRepository extends JpaRepository<Promocion, Long> {

    /** Promociones activas y vigentes en el momento dado, en el orden del banner. */
    @Query("""
            select p from Promocion p
            where p.activa = true
              and (p.vigenteDesde is null or p.vigenteDesde <= :ahora)
              and (p.vigenteHasta is null or p.vigenteHasta >= :ahora)
            order by p.orden asc, p.id asc
            """)
    List<Promocion> findVigentes(@Param("ahora") Instant ahora);

    /**
     * Promociones activas de un tipo cuyo precio es menor que su costo. Para las alertas de
     * pérdida de las ofertas flash.
     */
    @Query("""
            select p from Promocion p where p.activa = true and p.tipo = :tipo and p.costoEstimado is not null and p.precioPromocional < p.costoEstimado
            """)
    List<Promocion> findEnPerdida(@Param("tipo") TipoPromocion tipo);
}
