package com.totospizza.service.impl.catalogo;

import java.util.Locale;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.common.PageResponse;
import com.totospizza.dto.response.catalogo.HomeResponse;
import com.totospizza.dto.response.catalogo.MenuFiltrosResponse;
import com.totospizza.dto.response.catalogo.ProductoDetalleResponse;
import com.totospizza.dto.response.catalogo.ProductoResumenResponse;
import com.totospizza.exception.RecursoNoEncontradoException;
import com.totospizza.mapper.catalogo.CategoriaMapper;
import com.totospizza.mapper.catalogo.EtiquetaMapper;
import com.totospizza.mapper.catalogo.ProductoMapper;
import com.totospizza.repository.catalogo.CategoriaRepository;
import com.totospizza.repository.catalogo.EtiquetaRepository;
import com.totospizza.repository.catalogo.ProductoRepository;
import com.totospizza.service.catalogo.MenuService;
import com.totospizza.service.catalogo.PromocionService;
import com.totospizza.service.configuracion.ConfiguracionService;
import com.totospizza.service.resena.ResenaService;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MenuServiceImpl implements MenuService {

    private static final int DESTACADOS_EN_HOME = 8;
    private static final int RESENAS_EN_HOME = 6;

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final EtiquetaRepository etiquetaRepository;
    private final ProductoMapper productoMapper;
    private final CategoriaMapper categoriaMapper;
    private final EtiquetaMapper etiquetaMapper;
    private final CatalogoDetalleAssembler detalleAssembler;
    private final PromocionService promocionService;
    private final ResenaService resenaService;
    private final ConfiguracionService configuracionService;

    @Override
    public HomeResponse home() {
        return new HomeResponse(
                promocionService.vigentes(),
                productoMapper.toResumenes(productoRepository
                        .findByDestacadoTrueAndDisponibleTrueOrderByNombreAsc(PageRequest.of(0, DESTACADOS_EN_HOME))),
                resenaService.destacadas(RESENAS_EN_HOME),
                configuracionService.publica());
    }

    @Override
    public PageResponse<ProductoResumenResponse> buscar(String categoriaSlug, String etiquetaSlug, String texto, Pageable pageable) {
        String patron = "%" + (texto == null ? "" : texto.trim().toLowerCase(Locale.ROOT)) + "%";
        return PageResponse.of(productoRepository
                .buscarEnMenu(vacioANulo(categoriaSlug), vacioANulo(etiquetaSlug), patron, pageable)
                .map(productoMapper::toResumen));
    }

    @Override
    public ProductoDetalleResponse detalle(String slug) {
        return detalleAssembler.armar(productoRepository.findBySlugAndDisponibleTrue(slug)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto", slug)));
    }

    @Override
    public MenuFiltrosResponse filtros() {
        return new MenuFiltrosResponse(
                categoriaMapper.toResponses(categoriaRepository.findByActivaTrueOrderByOrdenAsc()),
                etiquetaMapper.toResponses(etiquetaRepository.findByEsFiltroTrueOrderByNombreAsc()));
    }

    private static String vacioANulo(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }
}
