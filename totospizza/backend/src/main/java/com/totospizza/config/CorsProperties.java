package com.totospizza.config;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/** Orígenes del frontend autorizados a llamar a la API desde el navegador. */
@ConfigurationProperties(prefix = "app.cors")
public record CorsProperties(@DefaultValue("http://localhost:4200") List<String> origenesPermitidos) {
}
