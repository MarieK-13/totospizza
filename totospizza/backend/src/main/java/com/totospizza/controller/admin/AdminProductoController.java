package com.totospizza.controller.admin;

import jakarta.validation.Valid;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import com.totospizza.controller.comun.Paginas;
import com.totospizza.dto.common.PageResponse;
import com.totospizza.dto.request.catalogo.CambiarDisponibilidadRequest;
import com.totospizza.dto.request.catalogo.ProductoRequest;
import com.totospizza.dto.response.catalogo.ProductoDetalleResponse;
import com.totospizza.dto.response.catalogo.ProductoResumenResponse;
import com.totospizza.service.catalogo.ProductoService;

/** Administración del catálogo de productos. */
@RestController
@RequestMapping("/api/v1/admin/productos")
@PreAuthorize("hasRole('ADMINISTRADOR')")
@RequiredArgsConstructor
public class AdminProductoController {

    private final ProductoService productoService;

    @GetMapping
    public PageResponse<ProductoResumenResponse> listar(@RequestParam(defaultValue = "0") int pagina,
                                                        @RequestParam(defaultValue = "20") int tamano) {
        return productoService.listar(Paginas.de(pagina, tamano, Sort.by("nombre")));
    }

    @GetMapping("/{id}")
    public ProductoDetalleResponse obtener(@PathVariable Long id) {
        return productoService.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductoDetalleResponse crear(@Valid @RequestBody ProductoRequest request) {
        return productoService.crear(request);
    }

    @PutMapping("/{id}")
    public ProductoDetalleResponse actualizar(@PathVariable Long id, @Valid @RequestBody ProductoRequest request) {
        return productoService.actualizar(id, request);
    }

    @PatchMapping("/{id}/disponibilidad")
    public ProductoDetalleResponse cambiarDisponibilidad(@PathVariable Long id,
                                                         @Valid @RequestBody CambiarDisponibilidadRequest request) {
        return productoService.cambiarDisponibilidad(id, request);
    }
}
