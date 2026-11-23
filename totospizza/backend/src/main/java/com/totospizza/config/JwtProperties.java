package com.totospizza.config;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * Ajustes del token de acceso. El secreto no tiene valor por defecto a propósito: en producción
 * se entrega por variable de entorno y la aplicación no arranca sin él.
 */
@ConfigurationProperties(prefix = "app.jwt")
public record JwtProperties(
        String secreto,
        @DefaultValue("totospizza") String emisor,
        @DefaultValue("15m") Duration accesoDuracion,
        @DefaultValue("7d") Duration refreshDuracion
) {
}
