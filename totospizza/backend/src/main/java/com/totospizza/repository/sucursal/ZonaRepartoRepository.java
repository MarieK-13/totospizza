package com.totospizza.repository.sucursal;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.totospizza.model.entity.sucursal.ZonaReparto;

/**
 * Zonas de reparto y tarifas de envío.
 */
public interface ZonaRepartoRepository extends JpaRepository<ZonaReparto, Long> {

    /** Zonas de reparto de una sucursal, de la más cercana a la más lejana. */
    List<ZonaReparto> findBySucursalIdAndActivaTrueOrderByDistanciaDesdeKmAsc(Long sucursalId);

    /**
     * Zona y tarifa que corresponden a una distancia. Vacío si la dirección está fuera de cobertura.
     */
    @Query("""
            select z from ZonaReparto z
            where z.sucursal.id = :sucursalId and z.activa = true
              and :distanciaKm >= z.distanciaDesdeKm and :distanciaKm < z.distanciaHastaKm
            """)
    Optional<ZonaReparto> findPorDistancia(@Param("sucursalId") Long sucursalId, @Param("distanciaKm") BigDecimal distanciaKm);

    /** Nombres de los barrios con reparto. Para la franja "Delivery a tu barrio". */
    @Query("""
            select distinct z.nombre from ZonaReparto z where z.activa = true order by z.nombre asc
            """)
    List<String> findNombresActivos();
}
