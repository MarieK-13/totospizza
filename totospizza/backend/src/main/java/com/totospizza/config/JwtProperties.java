package com.totospizza.config;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties(prefix = "app.jwt")
public record JwtProperties(
        String secreto,
        @DefaultValue("totospizza") String emisor,
        @DefaultValue("15m") Duration accesoDuracion,
        @DefaultValue("7d") Duration refreshDuracion
) {
}
