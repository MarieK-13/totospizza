package com.totospizza.service.impl.catalogo;

import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.common.PageResponse;
import com.totospizza.dto.request.catalogo.CambiarDisponibilidadRequest;
import com.totospizza.dto.request.catalogo.ProductoRequest;
import com.totospizza.dto.request.catalogo.ProductoTamanoRequest;
import com.totospizza.dto.response.catalogo.ProductoDetalleResponse;
import com.totospizza.dto.response.catalogo.ProductoResumenResponse;
import com.totospizza.exception.RecursoNoEncontradoException;
import com.totospizza.exception.ReglaNegocioException;
import com.totospizza.mapper.catalogo.ProductoMapper;
import com.totospizza.model.entity.catalogo.Etiqueta;
import com.totospizza.model.entity.catalogo.Ingrediente;
import com.totospizza.model.entity.catalogo.Producto;
import com.totospizza.model.entity.catalogo.ProductoTamano;
import com.totospizza.model.entity.catalogo.TamanoPizza;
import com.totospizza.repository.catalogo.CategoriaRepository;
import com.totospizza.repository.catalogo.EtiquetaRepository;
import com.totospizza.repository.catalogo.IngredienteRepository;
import com.totospizza.repository.catalogo.ProductoRepository;
import com.totospizza.repository.catalogo.TamanoPizzaRepository;
import com.totospizza.service.catalogo.ProductoService;
import com.totospizza.util.SlugUtil;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductoServiceImpl implements ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final EtiquetaRepository etiquetaRepository;
    private final TamanoPizzaRepository tamanoRepository;
    private final IngredienteRepository ingredienteRepository;
    private final ProductoMapper productoMapper;
    private final CatalogoDetalleAssembler detalleAssembler;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductoResumenResponse> listar(Pageable pageable) {
        return PageResponse.of(productoRepository.findAll(pageable).map(productoMapper::toResumen));
    }

    @Override
    @Transactional(readOnly = true)
    public ProductoDetalleResponse obtener(Long id) {
        return detalleAssembler.armar(producto(id));
    }

    @Override
    public ProductoDetalleResponse crear(ProductoRequest request) {
        Producto producto = productoMapper.toEntity(request);
        producto.setSlug(SlugUtil.unico(request.nombre(), productoRepository::existsBySlug));
        aplicarRelaciones(producto, request);
        return detalleAssembler.armar(productoRepository.save(producto));
    }

    @Override
    public ProductoDetalleResponse actualizar(Long id, ProductoRequest request) {
        Producto producto = producto(id);
        productoMapper.updateEntity(request, producto);
        aplicarRelaciones(producto, request);
        return detalleAssembler.armar(producto);
    }

    @Override
    public ProductoDetalleResponse cambiarDisponibilidad(Long id, CambiarDisponibilidadRequest request) {
        Producto producto = producto(id);
        producto.setDisponible(request.disponible());
        return detalleAssembler.armar(producto);
    }

    private void aplicarRelaciones(Producto producto, ProductoRequest request) {
        producto.setCategoria(categoriaRepository.findById(request.categoriaId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoría", request.categoriaId())));
        producto.setEtiquetas(etiquetas(request.etiquetaIds()));
        producto.setIngredientes(ingredientes(request.ingredienteIds()));
        sincronizarPrecios(producto, request);
    }

    private Set<Etiqueta> etiquetas(Set<Long> ids) {
        List<Etiqueta> encontradas = etiquetaRepository.findAllById(ids);
        if (encontradas.size() != ids.size()) {
            throw new RecursoNoEncontradoException("Etiqueta", ids);
        }
        return new HashSet<>(encontradas);
    }

    private Set<Ingrediente> ingredientes(Set<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return new HashSet<>();
        }
        List<Ingrediente> encontrados = ingredienteRepository.findAllById(ids);
        if (encontrados.size() != ids.size()) {
            throw new RecursoNoEncontradoException("Ingrediente", ids);
        }
        return new HashSet<>(encontrados);
    }

    private void sincronizarPrecios(Producto producto, ProductoRequest request) {
        List<ProductoTamanoRequest> pedidos = request.precios();
        if (request.requiereTamano() && pedidos.isEmpty()) {
            throw new ReglaNegocioException("PRECIOS_REQUERIDOS", "Indica el precio de al menos un tamaño");
        }
        Set<Long> tamanoIds = pedidos.stream().map(ProductoTamanoRequest::tamanoId).collect(Collectors.toSet());
        if (tamanoIds.size() != pedidos.size()) {
            throw new ReglaNegocioException("TAMANO_REPETIDO", "Un tamaño no puede tener dos precios");
        }

        Map<Long, ProductoTamano> actuales = producto.getPrecios().stream()
                .collect(Collectors.toMap(p -> p.getTamano().getId(), Function.identity()));

        for (Iterator<ProductoTamano> it = producto.getPrecios().iterator(); it.hasNext(); ) {
            if (!tamanoIds.contains(it.next().getTamano().getId())) {
                it.remove();
            }
        }
        for (ProductoTamanoRequest pedido : pedidos) {
            ProductoTamano precio = actuales.get(pedido.tamanoId());
            if (precio == null) {
                precio = new ProductoTamano();
                precio.setProducto(producto);
                precio.setTamano(tamano(pedido.tamanoId()));
                producto.getPrecios().add(precio);
            }
            precio.setPrecio(pedido.precio());
        }
    }

    private TamanoPizza tamano(Long id) {
        return tamanoRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Tamaño", id));
    }

    private Producto producto(Long id) {
        return productoRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Producto", id));
    }
}
