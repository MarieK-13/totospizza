package com.totospizza.repository.pedido.projection;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Pedidos y monto vendido en un día, según la hora de Lima. Alimenta el gráfico "Pedidos por día".
 */
public interface VentaDiaria {

    LocalDate getFecha();
    Long getPedidos();
    BigDecimal getTotal();
}
