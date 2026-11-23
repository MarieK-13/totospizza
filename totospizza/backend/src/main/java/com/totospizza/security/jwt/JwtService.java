package com.totospizza.security.jwt;

import java.time.Duration;

import com.totospizza.model.entity.seguridad.Usuario;

/**
 * Puerto para emitir el access token. La implementación (firma HS256/RS256, claims, rol) vive
 * en este mismo paquete y se escribe junto con la configuración de seguridad.
 */
public interface JwtService {

    /** JWT de corta duración con el id, el correo y el rol del usuario. */
    String generarAccessToken(Usuario usuario);

    /** Vigencia del access token, en segundos. */
    long getExpiracionSegundos();

    /** Vigencia del refresh token. */
    Duration getDuracionRefresh();
}
