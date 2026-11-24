package com.totospizza.service.catalogo;

import org.springframework.data.domain.Pageable;

import com.totospizza.dto.common.PageResponse;
import com.totospizza.dto.request.catalogo.CambiarDisponibilidadRequest;
import com.totospizza.dto.request.catalogo.ProductoRequest;
import com.totospizza.dto.response.catalogo.ProductoDetalleResponse;
import com.totospizza.dto.response.catalogo.ProductoResumenResponse;

/**
 * Administración del catálogo (solo administrador). 
 */
public interface ProductoService {

    PageResponse<ProductoResumenResponse> listar(Pageable pageable);

    ProductoDetalleResponse obtener(Long id);

    ProductoDetalleResponse crear(ProductoRequest request);

    ProductoDetalleResponse actualizar(Long id, ProductoRequest request);

    ProductoDetalleResponse cambiarDisponibilidad(Long id, CambiarDisponibilidadRequest request);
}
