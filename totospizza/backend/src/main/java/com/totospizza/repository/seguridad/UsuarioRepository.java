package com.totospizza.repository.seguridad;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.totospizza.model.entity.seguridad.Usuario;
import com.totospizza.model.enums.Rol;
import com.totospizza.model.enums.TipoDocumento;

/**
 * Acceso a los usuarios del sistema.
 */
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    /** Busca un usuario por su correo, que es su nombre de acceso. */
    Optional<Usuario> findByCorreo(String correo);

    /** Indica si ya existe una cuenta con ese correo. */
    boolean existsByCorreo(String correo);

    /** Indica si ya existe una cuenta con ese documento de identidad. */
    boolean existsByDocumentoTipoAndDocumentoNumero(TipoDocumento tipo, String numero);

    /** Lista los usuarios activos de un rol. */
    List<Usuario> findByRolAndActivoTrue(Rol rol);

    /**
     * Guarda la fecha del último acceso. Actualiza también la fecha de modificación 
     */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("""
            update Usuario u set u.ultimoAcceso = :ahora, u.actualizadoEn = :ahora where u.id = :id
            """)
    int registrarAcceso(@Param("id") Long id, @Param("ahora") Instant ahora);
}
