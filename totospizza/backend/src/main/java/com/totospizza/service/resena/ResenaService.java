package com.totospizza.service.resena;

import java.util.List;

import org.springframework.data.domain.Pageable;

import com.totospizza.dto.common.PageResponse;
import com.totospizza.dto.request.catalogo.CambiarDisponibilidadRequest;
import com.totospizza.dto.request.resena.ResenaRequest;
import com.totospizza.dto.response.resena.ResenaResponse;
import com.totospizza.dto.response.resena.ResumenCalificacionResponse;

/**
 * Reseñas de pedidos entregados. Una por pedido, y solo el cliente que lo hizo. Las
 * calificaciones por producto alimentan el promedio que se muestra en el menú.
 */
public interface ResenaService {

    ResenaResponse crear(Long usuarioId, ResenaRequest request);

    /** Reseñas destacadas y visibles, para la página de inicio. */
    List<ResenaResponse> destacadas(int limite);

    ResumenCalificacionResponse resumenProducto(Long productoId);

    /** Todas, para moderación (administrador). */
    PageResponse<ResenaResponse> listar(Pageable pageable);

    /** El campo {@code disponible} del request indica si queda destacada. */
    ResenaResponse cambiarDestacada(Long id, CambiarDisponibilidadRequest request);

    /** El campo {@code disponible} del request indica si queda visible. */
    ResenaResponse cambiarVisible(Long id, CambiarDisponibilidadRequest request);
}
