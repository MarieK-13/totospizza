package com.totospizza.config;

import java.nio.file.Path;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import lombok.RequiredArgsConstructor;

/**
 * Sirve las imágenes subidas en {@code /uploads/**} directamente desde la carpeta local.
 */
@Configuration
@RequiredArgsConstructor
@EnableConfigurationProperties(ArchivosProperties.class)
public class ArchivosConfig implements WebMvcConfigurer {

    public static final String RUTA_PUBLICA = "/uploads/";

    private final ArchivosProperties propiedades;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String carpeta = Path.of(propiedades.directorio()).toAbsolutePath().normalize().toUri().toString();
        registry.addResourceHandler(RUTA_PUBLICA + "**")
                .addResourceLocations(carpeta.endsWith("/") ? carpeta : carpeta + "/")
                .setCachePeriod(86_400);
    }
}
