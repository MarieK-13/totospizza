package com.totospizza.rules.calculator;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Pago a un motorizado: tarifa fija por turno finalizado más un bono por cada entrega realizada.
 */
public final class CalculadoraPagoMotorizado {

    private CalculadoraPagoMotorizado() {
    }

    public record Liquidacion(BigDecimal montoBase, BigDecimal montoBonos, BigDecimal montoTotal) {
    }

    public static Liquidacion calcular(BigDecimal pagoBaseTurno, BigDecimal bonoPorEntrega,
                                       long turnosFinalizados, long entregasRealizadas) {
        BigDecimal base = monto(pagoBaseTurno, turnosFinalizados);
        BigDecimal bonos = monto(bonoPorEntrega, entregasRealizadas);
        return new Liquidacion(base, bonos, base.add(bonos));
    }

    private static BigDecimal monto(BigDecimal tarifa, long unidades) {
        BigDecimal valor = tarifa == null ? BigDecimal.ZERO : tarifa;
        return valor.multiply(BigDecimal.valueOf(unidades)).setScale(2, RoundingMode.HALF_UP);
    }
}
