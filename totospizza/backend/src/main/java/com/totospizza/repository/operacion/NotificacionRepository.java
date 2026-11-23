package com.totospizza.repository.operacion;

import java.time.Instant;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.totospizza.model.entity.operacion.Notificacion;

/**
 * Notificaciones de los usuarios.
 */
public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    /** Notificaciones de un usuario, las más recientes primero. */
    Page<Notificacion> findByUsuarioIdOrderByCreadoEnDesc(Long usuarioId, Pageable pageable);

    /** Cantidad de notificaciones sin leer. Para el punto de la campana. */
    long countByUsuarioIdAndLeidaFalse(Long usuarioId);

    /** Marca como leídas todas las notificaciones de un usuario. */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("""
            update Notificacion n set n.leida = true, n.leidaEn = :ahora, n.actualizadoEn = :ahora where n.usuario.id = :usuarioId and n.leida = false
            """)
    int marcarTodasLeidas(@Param("usuarioId") Long usuarioId, @Param("ahora") Instant ahora);
}
