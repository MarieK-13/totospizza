package com.totospizza.config;

import java.nio.charset.StandardCharsets;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import com.nimbusds.jose.jwk.source.ImmutableSecret;

@Configuration
public class JwtConfig {

    private static final int BYTES_MINIMOS = 32;

    @Bean
    public JwtEncoder jwtEncoder(JwtProperties propiedades) {
        return new NimbusJwtEncoder(new ImmutableSecret<>(clave(propiedades)));
    }

    @Bean
    public JwtDecoder jwtDecoder(JwtProperties propiedades) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(clave(propiedades))
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
        decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer(propiedades.emisor()));
        return decoder;
    }

    private static SecretKey clave(JwtProperties propiedades) {
        String secreto = propiedades.secreto();
        if (secreto == null || secreto.getBytes(StandardCharsets.UTF_8).length < BYTES_MINIMOS) {
            throw new IllegalStateException(
                    "app.jwt.secreto es obligatorio y debe tener al menos " + BYTES_MINIMOS + " caracteres");
        }
        return new SecretKeySpec(secreto.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
    }
}
