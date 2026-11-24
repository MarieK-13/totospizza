package com.totospizza.service.catalogo;

import java.util.List;

import com.totospizza.dto.request.catalogo.CambiarDisponibilidadRequest;
import com.totospizza.dto.request.catalogo.TipoMasaRequest;
import com.totospizza.dto.response.catalogo.TipoMasaResponse;

/** Tipos de masa: lista pública de activas y administración. */
public interface TipoMasaService {

    List<TipoMasaResponse> listarActivas();

    List<TipoMasaResponse> listar();

    TipoMasaResponse crear(TipoMasaRequest request);

    TipoMasaResponse actualizar(Long id, TipoMasaRequest request);

    TipoMasaResponse cambiarActiva(Long id, CambiarDisponibilidadRequest request);
}
