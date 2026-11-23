package com.totospizza.repository.catalogo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.totospizza.model.entity.catalogo.TipoMasa;

/**
 * Tipos de masa.
 */
public interface TipoMasaRepository extends JpaRepository<TipoMasa, Long> {

    /** Masas disponibles. */
    List<TipoMasa> findByActivaTrueOrderByNombreAsc();
}
