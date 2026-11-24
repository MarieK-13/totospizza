package com.totospizza.rules.calculator;

import java.math.BigDecimal;
import java.math.RoundingMode;

import com.totospizza.dto.response.pedido.ResumenMontosResponse;
import com.totospizza.model.enums.TipoEntrega;

/**
 * Reglas de precio del pedido. 
 */
public final class CalculadoraMontos {

    private CalculadoraMontos() {
    }

    public static ResumenMontosResponse calcular(BigDecimal subtotal, TipoEntrega tipoEntrega,
                                                 BigDecimal costoZona, BigDecimal costoBase,
                                                 BigDecimal envioGratisDesde, BigDecimal descuento) {
        BigDecimal sub = escala(subtotal);
        BigDecimal desc = escala(descuento);
        BigDecimal delivery = costoDelivery(sub, tipoEntrega, costoZona, costoBase, envioGratisDesde);
        BigDecimal total = sub.subtract(desc).max(BigDecimal.ZERO).add(delivery);
        BigDecimal faltante = envioGratisDesde.subtract(sub).max(BigDecimal.ZERO);
        return new ResumenMontosResponse(sub, delivery, desc, escala(total), escala(envioGratisDesde), escala(faltante));
    }

    private static BigDecimal costoDelivery(BigDecimal subtotal, TipoEntrega tipoEntrega, BigDecimal costoZona,
                                            BigDecimal costoBase, BigDecimal envioGratisDesde) {
        if (tipoEntrega == TipoEntrega.RECOJO || subtotal.compareTo(envioGratisDesde) >= 0) {
            return escala(BigDecimal.ZERO);
        }
        return escala(costoZona != null ? costoZona : costoBase);
    }

    private static BigDecimal escala(BigDecimal valor) {
        return valor.setScale(2, RoundingMode.HALF_UP);
    }
}
