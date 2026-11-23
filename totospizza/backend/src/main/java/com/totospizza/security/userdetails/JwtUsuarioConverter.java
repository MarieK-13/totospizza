package com.totospizza.security.userdetails;

import java.util.List;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import com.totospizza.model.enums.Rol;
import com.totospizza.security.jwt.JwtServiceImpl;

/**
 * Convierte un token ya verificado en la identidad de la petición: el principal es un
 * {@link UsuarioAutenticado} y el rol se vuelve la autoridad {@code ROLE_<ROL>} que usa
 * {@code hasRole(...)}.
 */
@Component
public class JwtUsuarioConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        try {
            Rol rol = Rol.valueOf(jwt.getClaimAsString(JwtServiceImpl.CLAIM_ROL));
            UsuarioAutenticado usuario = new UsuarioAutenticado(
                    Long.valueOf(jwt.getSubject()), jwt.getClaimAsString(JwtServiceImpl.CLAIM_CORREO), rol);
            return new UsernamePasswordAuthenticationToken(usuario, jwt,
                    List.of(new SimpleGrantedAuthority("ROLE_" + rol.name())));
        } catch (RuntimeException e) {
            throw new BadCredentialsException("Token con datos inválidos", e);
        }
    }
}
