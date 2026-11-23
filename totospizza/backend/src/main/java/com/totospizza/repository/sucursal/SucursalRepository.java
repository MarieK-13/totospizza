package com.totospizza.repository.sucursal;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.totospizza.model.entity.sucursal.Sucursal;

/**
 * Sucursales.
 */
public interface SucursalRepository extends JpaRepository<Sucursal, Long> {

    /** Sucursales activas con sus horarios. Las zonas de reparto se cargan por lotes. */
    @EntityGraph(attributePaths = {"horarios"})
    List<Sucursal> findByActivaTrueOrderByNombreAsc();

    /** Busca una sucursal por su nombre. */
    Optional<Sucursal> findByNombre(String nombre);
}
