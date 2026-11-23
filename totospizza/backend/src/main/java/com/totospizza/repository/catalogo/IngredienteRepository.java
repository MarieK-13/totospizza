package com.totospizza.repository.catalogo;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.totospizza.model.entity.catalogo.Ingrediente;
import com.totospizza.model.enums.TipoIngrediente;

/**
 * Ingredientes para personalizar y adicionales.
 */
public interface IngredienteRepository extends JpaRepository<Ingrediente, Long> {

    /** Ingredientes disponibles de un tipo, por ejemplo todos los quesos del paso 2. */
    List<Ingrediente> findByTipoAndDisponibleTrueOrderByNombreAsc(TipoIngrediente tipo);

    /**
     * Ingredientes disponibles de varios tipos, por ejemplo los adicionales del detalle del producto.
     */
    List<Ingrediente> findByTipoInAndDisponibleTrueOrderByTipoAscNombreAsc(Collection<TipoIngrediente> tipos);

    /** Carga de una sola vez los ingredientes elegidos para validarlos. */
    List<Ingrediente> findByIdInAndDisponibleTrue(Collection<Long> ids);
}
