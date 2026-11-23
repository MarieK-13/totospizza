package com.totospizza.controller.publico;

import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import com.totospizza.controller.comun.Paginas;
import com.totospizza.dto.common.PageResponse;
import com.totospizza.dto.response.catalogo.HomeResponse;
import com.totospizza.dto.response.catalogo.MenuFiltrosResponse;
import com.totospizza.dto.response.catalogo.ProductoDetalleResponse;
import com.totospizza.dto.response.catalogo.ProductoResumenResponse;
import com.totospizza.service.catalogo.MenuService;

/** Catálogo abierto a visitantes: portada, menú y detalle de producto. */
@RestController
@RequestMapping("/api/v1/publico")
@RequiredArgsConstructor
public class MenuPublicoController {

    private final MenuService menuService;

    @GetMapping("/home")
    public HomeResponse home() {
        return menuService.home();
    }

    @GetMapping("/menu")
    public PageResponse<ProductoResumenResponse> menu(@RequestParam(required = false) String categoria,
                                                      @RequestParam(required = false) String etiqueta,
                                                      @RequestParam(name = "q", required = false) String texto,
                                                      @RequestParam(defaultValue = "0") int pagina,
                                                      @RequestParam(defaultValue = "20") int tamano) {
        return menuService.buscar(categoria, etiqueta, texto, Paginas.de(pagina, tamano, Sort.by("nombre")));
    }

    @GetMapping("/menu/filtros")
    public MenuFiltrosResponse filtros() {
        return menuService.filtros();
    }

    @GetMapping("/menu/{slug}")
    public ProductoDetalleResponse detalle(@PathVariable String slug) {
        return menuService.detalle(slug);
    }
}
