package com.totospizza.service.personalizacion;

import java.util.List;

import com.totospizza.dto.request.personalizacion.PizzaPersonalizadaRequest;
import com.totospizza.dto.response.personalizacion.CotizacionPizzaResponse;
import com.totospizza.dto.response.personalizacion.OpcionesPersonalizacionResponse;
import com.totospizza.dto.response.personalizacion.PizzaPersonalizadaResponse;

/**
 * Armado de pizza por pasos: tamaño y masa, quesos, salsas e ingredientes (máximo 2 por paso).
 * Cada elección se valida contra el catálogo: ingredientes disponibles y del tipo del paso.
 */
public interface PizzaPersonalizadaService {

    /** Tamaños, masas y opciones de cada paso. */
    OpcionesPersonalizacionResponse opciones();

    /** Precio en vivo; no guarda nada. */
    CotizacionPizzaResponse cotizar(PizzaPersonalizadaRequest request);

    PizzaPersonalizadaResponse guardar(Long usuarioId, PizzaPersonalizadaRequest request);

    List<PizzaPersonalizadaResponse> listar(Long usuarioId);

    PizzaPersonalizadaResponse obtener(Long usuarioId, Long pizzaId);
}
