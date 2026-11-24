package com.totospizza.service.impl.catalogo;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.request.catalogo.CambiarDisponibilidadRequest;
import com.totospizza.dto.request.catalogo.CategoriaRequest;
import com.totospizza.dto.response.catalogo.CategoriaResponse;
import com.totospizza.exception.ConflictoException;
import com.totospizza.exception.RecursoNoEncontradoException;
import com.totospizza.mapper.catalogo.CategoriaMapper;
import com.totospizza.model.entity.catalogo.Categoria;
import com.totospizza.repository.catalogo.CategoriaRepository;
import com.totospizza.repository.catalogo.ProductoRepository;
import com.totospizza.service.catalogo.CategoriaService;
import com.totospizza.util.SlugUtil;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoriaServiceImpl implements CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;
    private final CategoriaMapper categoriaMapper;

    @Override
    @Transactional(readOnly = true)
    public List<CategoriaResponse> listar() {
        return categoriaMapper.toResponses(categoriaRepository.findAllByOrderByOrdenAscNombreAsc());
    }

    @Override
    public CategoriaResponse crear(CategoriaRequest request) {
        String nombre = request.nombre().trim();
        if (categoriaRepository.existsByNombreIgnoreCase(nombre)) {
            throw duplicada(nombre);
        }
        Categoria categoria = categoriaMapper.toEntity(request);
        categoria.setNombre(nombre);
        categoria.setSlug(SlugUtil.unico(nombre, categoriaRepository::existsBySlug));
        return categoriaMapper.toResponse(categoriaRepository.save(categoria));
    }

    @Override
    public CategoriaResponse actualizar(Long id, CategoriaRequest request) {
        Categoria categoria = categoria(id);
        String nombre = request.nombre().trim();
        if (categoriaRepository.existsByNombreIgnoreCaseAndIdNot(nombre, id)) {
            throw duplicada(nombre);
        }
        boolean cambioNombre = !categoria.getNombre().equals(nombre);
        categoriaMapper.updateEntity(request, categoria);
        categoria.setNombre(nombre);
        if (cambioNombre) {
            categoria.setSlug(SlugUtil.unico(nombre,
                    slug -> !slug.equals(categoria.getSlug()) && categoriaRepository.existsBySlug(slug)));
        }
        return categoriaMapper.toResponse(categoria);
    }

    @Override
    public CategoriaResponse cambiarActiva(Long id, CambiarDisponibilidadRequest request) {
        Categoria categoria = categoria(id);
        categoria.setActiva(request.disponible());
        return categoriaMapper.toResponse(categoria);
    }

    @Override
    public void eliminar(Long id) {
        Categoria categoria = categoria(id);
        if (productoRepository.existsByCategoriaId(id)) {
            throw new ConflictoException("CATEGORIA_CON_PRODUCTOS",
                    "La categoría tiene productos. Muévelos a otra categoría o desactívala en lugar de eliminarla");
        }
        categoriaRepository.delete(categoria);
    }

    private Categoria categoria(Long id) {
        return categoriaRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Categoría", id));
    }

    private static ConflictoException duplicada(String nombre) {
        return new ConflictoException("CATEGORIA_DUPLICADA", "Ya existe una categoría llamada \"" + nombre + "\"");
    }
}
