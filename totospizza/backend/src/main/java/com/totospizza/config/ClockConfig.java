package com.totospizza.config;

import java.time.Clock;
import java.time.ZoneId;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Configuration
public class ClockConfig {

    public static final ZoneId ZONA_NEGOCIO = ZoneId.of("America/Lima");

    @Bean
    public Clock clock() {
        return Clock.system(ZONA_NEGOCIO);
    }
}
