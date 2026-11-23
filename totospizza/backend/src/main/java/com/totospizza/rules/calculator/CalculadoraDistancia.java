package com.totospizza.rules.calculator;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** Distancia en línea recta entre dos coordenadas (fórmula de Haversine). */
public final class CalculadoraDistancia {

    private static final double RADIO_TIERRA_KM = 6371.0088;

    private CalculadoraDistancia() {
    }

    /** Kilómetros con dos decimales. */
    public static BigDecimal kilometros(BigDecimal lat1, BigDecimal lon1, BigDecimal lat2, BigDecimal lon2) {
        double f1 = Math.toRadians(lat1.doubleValue());
        double f2 = Math.toRadians(lat2.doubleValue());
        double df = f2 - f1;
        double dl = Math.toRadians(lon2.doubleValue() - lon1.doubleValue());
        double a = Math.sin(df / 2) * Math.sin(df / 2)
                + Math.cos(f1) * Math.cos(f2) * Math.sin(dl / 2) * Math.sin(dl / 2);
        double km = 2 * RADIO_TIERRA_KM * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return BigDecimal.valueOf(km).setScale(2, RoundingMode.HALF_UP);
    }
}
