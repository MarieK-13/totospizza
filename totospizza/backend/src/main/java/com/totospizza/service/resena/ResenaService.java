package com.totospizza.service.resena;

import java.util.List;

import org.springframework.data.domain.Pageable;

import com.totospizza.dto.common.PageResponse;
import com.totospizza.dto.request.catalogo.CambiarDisponibilidadRequest;
import com.totospizza.dto.request.resena.ResenaRequest;
import com.totospizza.dto.response.resena.ResenaResponse;
import com.totospizza.dto.response.resena.ResumenCalificacionResponse;


public interface ResenaService {

    ResenaResponse crear(Long usuarioId, ResenaRequest request);

    List<ResenaResponse> destacadas(int limite);

    ResumenCalificacionResponse resumenProducto(Long productoId);

    PageResponse<ResenaResponse> listar(Pageable pageable);

    ResenaResponse cambiarDestacada(Long id, CambiarDisponibilidadRequest request);

    ResenaResponse cambiarVisible(Long id, CambiarDisponibilidadRequest request);
}
