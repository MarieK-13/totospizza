package com.totospizza.repository.catalogo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.totospizza.model.entity.catalogo.TamanoPizza;

/**
 * Tamaños de pizza.
 */
public interface TamanoPizzaRepository extends JpaRepository<TamanoPizza, Long> {

    /** Todos los tamaños, del más pequeño al más grande. */
    List<TamanoPizza> findAllByOrderByOrdenAsc();

    /** Tamaños que se ofrecen al armar pizzas. */
    List<TamanoPizza> findByActivoTrueOrderByOrdenAsc();

    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);
}
