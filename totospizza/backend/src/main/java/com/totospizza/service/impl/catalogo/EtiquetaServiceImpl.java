package com.totospizza.service.impl.catalogo;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.request.catalogo.EtiquetaRequest;
import com.totospizza.dto.response.catalogo.EtiquetaResponse;
import com.totospizza.exception.ConflictoException;
import com.totospizza.exception.RecursoNoEncontradoException;
import com.totospizza.mapper.catalogo.EtiquetaMapper;
import com.totospizza.model.entity.catalogo.Etiqueta;
import com.totospizza.repository.catalogo.EtiquetaRepository;
import com.totospizza.service.catalogo.EtiquetaService;
import com.totospizza.util.SlugUtil;

@Service
@RequiredArgsConstructor
@Transactional
public class EtiquetaServiceImpl implements EtiquetaService {

    private final EtiquetaRepository etiquetaRepository;
    private final EtiquetaMapper etiquetaMapper;

    @Override
    @Transactional(readOnly = true)
    public List<EtiquetaResponse> listar() {
        return etiquetaMapper.toResponses(etiquetaRepository.findAllByOrderByNombreAsc());
    }

    @Override
    public EtiquetaResponse crear(EtiquetaRequest request) {
        String nombre = request.nombre().trim();
        if (etiquetaRepository.existsByNombreIgnoreCase(nombre)) {
            throw duplicada(nombre);
        }
        Etiqueta etiqueta = etiquetaMapper.toEntity(request);
        etiqueta.setNombre(nombre);
        etiqueta.setSlug(SlugUtil.unico(nombre, etiquetaRepository::existsBySlug));
        return etiquetaMapper.toResponse(etiquetaRepository.save(etiqueta));
    }

    @Override
    public EtiquetaResponse actualizar(Long id, EtiquetaRequest request) {
        Etiqueta etiqueta = etiqueta(id);
        String nombre = request.nombre().trim();
        if (etiquetaRepository.existsByNombreIgnoreCaseAndIdNot(nombre, id)) {
            throw duplicada(nombre);
        }
        boolean cambioNombre = !etiqueta.getNombre().equals(nombre);
        etiquetaMapper.updateEntity(request, etiqueta);
        etiqueta.setNombre(nombre);
        if (cambioNombre) {
            etiqueta.setSlug(SlugUtil.unico(nombre,
                    slug -> !slug.equals(etiqueta.getSlug()) && etiquetaRepository.existsBySlug(slug)));
        }
        return etiquetaMapper.toResponse(etiqueta);
    }

    /** Al borrarla, los productos que la tenían simplemente la pierden. */
    @Override
    public void eliminar(Long id) {
        etiquetaRepository.delete(etiqueta(id));
    }

    private Etiqueta etiqueta(Long id) {
        return etiquetaRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Etiqueta", id));
    }

    private static ConflictoException duplicada(String nombre) {
        return new ConflictoException("ETIQUETA_DUPLICADA", "Ya existe una etiqueta llamada \"" + nombre + "\"");
    }
}
