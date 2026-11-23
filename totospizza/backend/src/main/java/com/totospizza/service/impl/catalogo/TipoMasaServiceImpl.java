package com.totospizza.service.impl.catalogo;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.request.catalogo.CambiarDisponibilidadRequest;
import com.totospizza.dto.request.catalogo.TipoMasaRequest;
import com.totospizza.dto.response.catalogo.TipoMasaResponse;
import com.totospizza.exception.RecursoNoEncontradoException;
import com.totospizza.mapper.catalogo.TipoMasaMapper;
import com.totospizza.model.entity.catalogo.TipoMasa;
import com.totospizza.repository.catalogo.TipoMasaRepository;
import com.totospizza.service.catalogo.TipoMasaService;

@Service
@RequiredArgsConstructor
@Transactional
public class TipoMasaServiceImpl implements TipoMasaService {

    private final TipoMasaRepository tipoMasaRepository;
    private final TipoMasaMapper tipoMasaMapper;

    @Override
    @Transactional(readOnly = true)
    public List<TipoMasaResponse> listarActivas() {
        return tipoMasaMapper.toResponses(tipoMasaRepository.findByActivaTrueOrderByNombreAsc());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TipoMasaResponse> listar() {
        return tipoMasaMapper.toResponses(tipoMasaRepository.findAll());
    }

    @Override
    public TipoMasaResponse crear(TipoMasaRequest request) {
        return tipoMasaMapper.toResponse(tipoMasaRepository.save(tipoMasaMapper.toEntity(request)));
    }

    @Override
    public TipoMasaResponse actualizar(Long id, TipoMasaRequest request) {
        TipoMasa masa = masa(id);
        tipoMasaMapper.updateEntity(request, masa);
        return tipoMasaMapper.toResponse(masa);
    }

    @Override
    public TipoMasaResponse cambiarActiva(Long id, CambiarDisponibilidadRequest request) {
        TipoMasa masa = masa(id);
        masa.setActiva(request.disponible());
        return tipoMasaMapper.toResponse(masa);
    }

    private TipoMasa masa(Long id) {
        return tipoMasaRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Tipo de masa", id));
    }
}
