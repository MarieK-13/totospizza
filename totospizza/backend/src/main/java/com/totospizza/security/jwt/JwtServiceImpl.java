package com.totospizza.security.jwt;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

import com.totospizza.config.JwtProperties;
import com.totospizza.model.entity.seguridad.Usuario;


@Service
@RequiredArgsConstructor
public class JwtServiceImpl implements JwtService {

    public static final String CLAIM_CORREO = "correo";
    public static final String CLAIM_ROL = "rol";

    private final JwtEncoder encoder;
    private final JwtProperties propiedades;
    private final Clock clock;

    @Override
    public String generarAccessToken(Usuario usuario) {
        Instant ahora = Instant.now(clock);
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(propiedades.emisor())
                .subject(String.valueOf(usuario.getId()))
                .issuedAt(ahora)
                .expiresAt(ahora.plus(propiedades.accesoDuracion()))
                .claim(CLAIM_CORREO, usuario.getCorreo())
                .claim(CLAIM_ROL, usuario.getRol().name())
                .build();
        JwsHeader cabecera = JwsHeader.with(MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(cabecera, claims)).getTokenValue();
    }

    @Override
    public long getExpiracionSegundos() {
        return propiedades.accesoDuracion().toSeconds();
    }

    @Override
    public Duration getDuracionRefresh() {
        return propiedades.refreshDuracion();
    }
}
