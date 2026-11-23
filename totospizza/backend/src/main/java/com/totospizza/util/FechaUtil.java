package com.totospizza.util;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;

/** Conversión de fechas de calendario a instantes en la zona horaria del negocio (la del {@link Clock}). */
public final class FechaUtil {

    private FechaUtil() {
    }

    /** 00:00 del día indicado. Límite inferior inclusivo de un rango. */
    public static Instant inicioDelDia(LocalDate fecha, Clock clock) {
        return fecha.atStartOfDay(clock.getZone()).toInstant();
    }

    /** 00:00 del día siguiente. Límite superior exclusivo de un rango que incluye el día indicado. */
    public static Instant finDelDia(LocalDate fecha, Clock clock) {
        return fecha.plusDays(1).atStartOfDay(clock.getZone()).toInstant();
    }

    public static LocalDate hoy(Clock clock) {
        return LocalDate.now(clock);
    }
}
