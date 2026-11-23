package com.totospizza.dto.response.seguridad;

import java.time.Instant;

import com.totospizza.model.enums.Rol;

/**
 * Datos públicos de un usuario. Nunca incluye hash de contraseña.
 */
public record UsuarioResponse(
        Long id,
        String nombres,
        String apellidos,
        String correo,
        String telefono,
        Rol rol,
        boolean activo,
        String avatarUrl,
        Instant ultimoAcceso
) {
}
