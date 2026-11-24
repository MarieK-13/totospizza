package com.totospizza.service.catalogo;

import java.util.List;

import com.totospizza.dto.request.catalogo.CambiarDisponibilidadRequest;
import com.totospizza.dto.request.catalogo.CategoriaRequest;
import com.totospizza.dto.response.catalogo.CategoriaResponse;

/** Administración de las categorías del menú. */
public interface CategoriaService {

    List<CategoriaResponse> listar();

    CategoriaResponse crear(CategoriaRequest request);

    CategoriaResponse actualizar(Long id, CategoriaRequest request);

    CategoriaResponse cambiarActiva(Long id, CambiarDisponibilidadRequest request);

    void eliminar(Long id);
}
