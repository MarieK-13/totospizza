package com.totospizza.repository.configuracion;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.totospizza.model.entity.configuracion.PerfilNegocio;

/**
 * Datos del negocio.
 */
public interface PerfilNegocioRepository extends JpaRepository<PerfilNegocio, Long> {

    /** Devuelve la única fila del perfil del negocio. */
    Optional<PerfilNegocio> findFirstByOrderByIdAsc();
}
