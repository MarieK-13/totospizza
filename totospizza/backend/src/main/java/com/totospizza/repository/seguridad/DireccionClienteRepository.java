package com.totospizza.repository.seguridad;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.totospizza.model.entity.seguridad.DireccionCliente;

/**
 * Direcciones guardadas por los clientes.
 */
public interface DireccionClienteRepository extends JpaRepository<DireccionCliente, Long> {

    /** Direcciones de un cliente, con la favorita primero. */
    List<DireccionCliente> findByUsuarioIdOrderByFavoritaDescCreadoEnDesc(Long usuarioId);

    /** Busca una dirección asegurando que pertenece al cliente. */
    Optional<DireccionCliente> findByIdAndUsuarioId(Long id, Long usuarioId);

    /** Quita la marca de favorita a las direcciones de un cliente, antes de marcar otra. */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("""
            update DireccionCliente d set d.favorita = false, d.actualizadoEn = :ahora where d.usuario.id = :usuarioId and d.favorita = true
            """)
    int quitarFavorita(@Param("usuarioId") Long usuarioId, @Param("ahora") Instant ahora);
}
