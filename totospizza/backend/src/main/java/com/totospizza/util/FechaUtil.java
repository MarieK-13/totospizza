package com.totospizza.util;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;

public final class FechaUtil {

    private FechaUtil() {
    }

    public static Instant inicioDelDia(LocalDate fecha, Clock clock) {
        return fecha.atStartOfDay(clock.getZone()).toInstant();
    }

    public static Instant finDelDia(LocalDate fecha, Clock clock) {
        return fecha.plusDays(1).atStartOfDay(clock.getZone()).toInstant();
    }

    public static LocalDate hoy(Clock clock) {
        return LocalDate.now(clock);
    }
}
