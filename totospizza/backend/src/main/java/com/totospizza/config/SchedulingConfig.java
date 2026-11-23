package com.totospizza.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/** Activa las tareas programadas del paquete {@code scheduler}. */
@Configuration
@EnableScheduling
public class SchedulingConfig {
}
