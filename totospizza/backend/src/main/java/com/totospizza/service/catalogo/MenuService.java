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

    PageResponse<ProductoResumenResponse> buscar(String categoriaSlug, String etiquetaSlug, String texto, Pageable pageable);

    ProductoDetalleResponse detalle(String slug);

    MenuFiltrosResponse filtros();
}
