package com.totospizza.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * Envío de correos. Con {@code habilitado=false} los correos solo se escriben en el log.
 */
@ConfigurationProperties(prefix = "app.correo")
public record CorreoProperties(
        @DefaultValue("false") boolean habilitado,
        String remitente,
        @DefaultValue("Toto's Pizza") String nombreRemitente,
        @DefaultValue("http://localhost:4200") String urlFrontend
) {

    /** Enlace de la página para crear una contraseña nueva. */
    public String enlaceRecuperacion(String token) {
        return urlFrontend.replaceAll("/+$", "") + "/restablecer-contrasena?token="
                + java.net.URLEncoder.encode(token, java.nio.charset.StandardCharsets.UTF_8);
    }
}
