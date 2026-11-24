package com.totospizza.rules.calculator;

import java.math.BigDecimal;
import java.util.Collection;

import com.totospizza.dto.response.personalizacion.CotizacionPizzaResponse;
import com.totospizza.model.entity.catalogo.Ingrediente;
import com.totospizza.model.entity.catalogo.TamanoPizza;
import com.totospizza.model.entity.catalogo.TipoMasa;

/** Precio de una pizza armada por el cliente */
public final class CalculadoraPizza {

    private CalculadoraPizza() {
    }

    public static CotizacionPizzaResponse cotizar(TamanoPizza tamano, TipoMasa masa,
                                                  Collection<Ingrediente> ingredientes) {
        BigDecimal precioTamano = tamano.getPrecioBase();
        BigDecimal recargo = masa.getRecargo();
        BigDecimal extras = ingredientes.stream()
                .map(Ingrediente::getPrecioExtra)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new CotizacionPizzaResponse(precioTamano, recargo, extras,
                precioTamano.add(recargo).add(extras));
    }
}
