package com.totospizza.service.catalogo;

import java.util.List;

import com.totospizza.dto.request.catalogo.CambiarDisponibilidadRequest;
import com.totospizza.dto.request.catalogo.TamanoPizzaRequest;
import com.totospizza.dto.response.catalogo.TamanoPizzaResponse;

/** Administración de los tamaños de pizza. */
public interface TamanoPizzaService {

    List<TamanoPizzaResponse> listar();

    TamanoPizzaResponse crear(TamanoPizzaRequest request);

    TamanoPizzaResponse actualizar(Long id, TamanoPizzaRequest request);

    TamanoPizzaResponse cambiarActivo(Long id, CambiarDisponibilidadRequest request);
}
