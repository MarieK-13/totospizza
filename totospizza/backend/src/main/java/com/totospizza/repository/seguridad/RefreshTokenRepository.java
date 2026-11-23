package com.totospizza.repository.seguridad;

import java.time.Instant;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.totospizza.model.entity.seguridad.RefreshToken;

/**
 * Tokens de refresco de sesión.
 */
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    /** Busca un token por su hash. */
    Optional<RefreshToken> findByTokenHash(String tokenHash);

    /** Cierra todas las sesiones de un usuario, por ejemplo al cambiar la contraseña. */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("""
            update RefreshToken t set t.revocado = true, t.actualizadoEn = :ahora where t.usuario.id = :usuarioId and t.revocado = false
            """)
    int revocarTodosDelUsuario(@Param("usuarioId") Long usuarioId, @Param("ahora") Instant ahora);

    /** Borra los tokens vencidos. Lo ejecuta una tarea programada. */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("""
            delete from RefreshToken t where t.expiraEn < :limite
            """)
    int eliminarExpirados(@Param("limite") Instant limite);
}
