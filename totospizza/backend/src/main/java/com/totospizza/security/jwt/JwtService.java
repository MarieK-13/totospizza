package com.totospizza.security.jwt;

import java.time.Duration;

import com.totospizza.model.entity.seguridad.Usuario;

public interface JwtService {

    /** JWT de corta duración con el id, el correo y el rol del usuario. */
    String generarAccessToken(Usuario usuario);

    /** Vigencia del access token, en segundos. */
    long getExpiracionSegundos();

    /** Vigencia del refresh token. */
    Duration getDuracionRefresh();
}
