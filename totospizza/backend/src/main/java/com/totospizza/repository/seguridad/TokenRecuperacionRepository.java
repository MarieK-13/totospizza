package com.totospizza.repository.seguridad;

import java.time.Instant;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.totospizza.model.entity.seguridad.TokenRecuperacion;

/**
 * Tokens para restablecer la contraseña.
 */
public interface TokenRecuperacionRepository extends JpaRepository<TokenRecuperacion, Long> {

    /** Busca un token que aún no se usó ni venció. */
    Optional<TokenRecuperacion> findByTokenHashAndUsadoEnIsNullAndExpiraEnAfter(String tokenHash, Instant ahora);

    /** Borra los tokens vencidos. Lo ejecuta una tarea programada. */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("""
            delete from TokenRecuperacion t where t.expiraEn < :limite
            """)
    int eliminarExpirados(@Param("limite") Instant limite);
}
