package com.totospizza.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.util.unit.DataSize;

/**
 * Carpeta local donde se guardan las imágenes que sube el administrador.
 */
@ConfigurationProperties(prefix = "app.archivos")
public record ArchivosProperties(
        @DefaultValue("uploads") String directorio,
        @DefaultValue("2MB") DataSize tamanoMaximoImagen
) {
}
