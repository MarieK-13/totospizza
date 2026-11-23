package com.totospizza.security.userdetails;

import com.totospizza.model.enums.Rol;

/**
 * Identidad del usuario que hace la petición, ya validada. El filtro JWT la deja como principal
 * de Spring Security y los controllers la reciben con {@code @AuthenticationPrincipal}: así nunca
 * se confía en un id enviado por el cliente.
 */
public record UsuarioAutenticado(Long id, String correo, Rol rol) {
}
