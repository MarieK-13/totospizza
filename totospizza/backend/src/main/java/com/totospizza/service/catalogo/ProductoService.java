package com.totospizza.service.catalogo;

import org.springframework.data.domain.Pageable;

import com.totospizza.dto.common.PageResponse;
import com.totospizza.dto.request.catalogo.CambiarDisponibilidadRequest;
import com.totospizza.dto.request.catalogo.ProductoRequest;
import com.totospizza.dto.response.catalogo.ProductoDetalleResponse;
import com.totospizza.dto.response.catalogo.ProductoResumenResponse;

/**
 * Administración del catálogo (solo administrador). Los productos no se borran: se marcan
 * como no disponibles, porque los pedidos antiguos los referencian.
 */
public interface ProductoService {

    /** Incluye los no disponibles. */
    PageResponse<ProductoResumenResponse> listar(Pageable pageable);

    ProductoDetalleResponse obtener(Long id);

    ProductoDetalleResponse crear(ProductoRequest request);

    /** El slug no cambia al editar, para no romper enlaces ya compartidos. */
    ProductoDetalleResponse actualizar(Long id, ProductoRequest request);

    ProductoDetalleResponse cambiarDisponibilidad(Long id, CambiarDisponibilidadRequest request);
}
