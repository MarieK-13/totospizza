package com.totospizza.service.personalizacion;

import java.util.List;

import com.totospizza.dto.request.personalizacion.PizzaPersonalizadaRequest;
import com.totospizza.dto.response.personalizacion.CotizacionPizzaResponse;
import com.totospizza.dto.response.personalizacion.OpcionesPersonalizacionResponse;
import com.totospizza.dto.response.personalizacion.PizzaPersonalizadaResponse;

public interface PizzaPersonalizadaService {

    OpcionesPersonalizacionResponse opciones();

    CotizacionPizzaResponse cotizar(PizzaPersonalizadaRequest request);

    PizzaPersonalizadaResponse guardar(Long usuarioId, PizzaPersonalizadaRequest request);

    List<PizzaPersonalizadaResponse> listar(Long usuarioId);

    PizzaPersonalizadaResponse obtener(Long usuarioId, Long pizzaId);
}
