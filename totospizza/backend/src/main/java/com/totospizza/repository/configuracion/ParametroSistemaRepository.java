package com.totospizza.repository.configuracion;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.totospizza.model.entity.configuracion.ParametroSistema;

/**
 * Parámetros de configuración.
 */
public interface ParametroSistemaRepository extends JpaRepository<ParametroSistema, Long> {

    /** Busca un parámetro por su clave. */
    Optional<ParametroSistema> findByClave(String clave);

    /** Todos los parámetros en orden alfabético. */
    List<ParametroSistema> findAllByOrderByClaveAsc();
}
