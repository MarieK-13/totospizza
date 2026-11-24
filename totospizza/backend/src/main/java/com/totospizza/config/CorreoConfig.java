package com.totospizza.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Habilita la configuración de correo y el envío en segundo plano, para que la petición no espere al servidor SMTP.
 */
@Configuration
@EnableAsync
@EnableConfigurationProperties(CorreoProperties.class)
public class CorreoConfig {
}
