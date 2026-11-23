package com.totospizza.service.catalogo;

import java.util.List;

import com.totospizza.dto.request.catalogo.CambiarDisponibilidadRequest;
import com.totospizza.dto.request.catalogo.IngredienteRequest;
import com.totospizza.dto.response.catalogo.IngredienteResponse;

/** Ingredientes: lista pública de disponibles y administración. */
public interface IngredienteService {

    List<IngredienteResponse> listarDisponibles();

    List<IngredienteResponse> listar();

    IngredienteResponse crear(IngredienteRequest request);

    IngredienteResponse actualizar(Long id, IngredienteRequest request);

    IngredienteResponse cambiarDisponibilidad(Long id, CambiarDisponibilidadRequest request);
}
