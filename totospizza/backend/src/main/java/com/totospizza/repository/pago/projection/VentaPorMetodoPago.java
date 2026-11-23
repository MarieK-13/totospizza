package com.totospizza.repository.pago.projection;

import java.math.BigDecimal;

import com.totospizza.model.enums.MetodoPago;

/**
 * Cantidad de pagos y monto cobrado por método de pago. Alimenta el gráfico "Métodos de pago".
 */
public interface VentaPorMetodoPago {

    MetodoPago getMetodo();
    Long getCantidad();
    BigDecimal getTotal();
}
