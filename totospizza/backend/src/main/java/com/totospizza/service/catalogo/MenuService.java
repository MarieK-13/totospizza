package com.totospizza.service.catalogo;

import org.springframework.data.domain.Pageable;

import com.totospizza.dto.common.PageResponse;
import com.totospizza.dto.response.catalogo.HomeResponse;
import com.totospizza.dto.response.catalogo.MenuFiltrosResponse;
import com.totospizza.dto.response.catalogo.ProductoDetalleResponse;
import com.totospizza.dto.response.catalogo.ProductoResumenResponse;

/** Lectura pública del catálogo: inicio, menú con filtros y detalle de producto. */
public interface MenuService {

    /** Promociones vigentes, destacados, reseñas y datos del negocio en una sola llamada. */
    HomeResponse home();

    /**
     * Productos disponibles del menú. Los filtros nulos o vacíos se ignoran.
     * {@code tamanoPizzaId} deja solo los productos que se venden en ese tamaño (filtro "para cuántas personas").
     */
    PageResponse<ProductoResumenResponse> buscar(String categoriaSlug, String etiquetaSlug, String texto, Long tamanoPizzaId, Pageable pageable);

    ProductoDetalleResponse detalle(String slug);

    MenuFiltrosResponse filtros();
}
