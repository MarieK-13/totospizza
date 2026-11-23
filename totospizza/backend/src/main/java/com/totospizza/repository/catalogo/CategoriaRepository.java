package com.totospizza.repository.catalogo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.totospizza.model.entity.catalogo.Categoria;

/**
 * Categorías de la carta.
 */
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    /** Categorías activas en el orden en que se muestran. */
    List<Categoria> findByActivaTrueOrderByOrdenAsc();

    /** Busca una categoría por su slug. */
    Optional<Categoria> findBySlug(String slug);
}
