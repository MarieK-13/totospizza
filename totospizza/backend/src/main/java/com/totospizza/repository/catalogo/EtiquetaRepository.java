package com.totospizza.repository.catalogo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.totospizza.model.entity.catalogo.Etiqueta;

/**
 * Etiquetas de los productos.
 */
public interface EtiquetaRepository extends JpaRepository<Etiqueta, Long> {

    /** Etiquetas que se muestran como chips de filtro del menú. */
    List<Etiqueta> findByEsFiltroTrueOrderByNombreAsc();

    /** Busca una etiqueta por su slug. */
    Optional<Etiqueta> findBySlug(String slug);
}
