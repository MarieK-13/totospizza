package com.totospizza.config;

import java.time.Clock;
import java.time.ZoneId;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Reloj del negocio. Todos los servicios reciben este {@link Clock} en lugar de llamar a
 * {@code now()}: así "hoy", los horarios de las sucursales y los cortes de reportes siguen la
 * hora de Lima aunque el servidor esté en UTC, y las pruebas pueden fijar la hora.
 */
@Configuration
public class ClockConfig {

    public static final ZoneId ZONA_NEGOCIO = ZoneId.of("America/Lima");

    @Bean
    public Clock clock() {
        return Clock.system(ZONA_NEGOCIO);
    }
}
