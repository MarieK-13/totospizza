package com.totospizza.service.impl.catalogo;

import java.util.EnumSet;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.request.catalogo.CambiarDisponibilidadRequest;
import com.totospizza.dto.request.catalogo.IngredienteRequest;
import com.totospizza.dto.response.catalogo.IngredienteResponse;
import com.totospizza.exception.RecursoNoEncontradoException;
import com.totospizza.mapper.catalogo.IngredienteMapper;
import com.totospizza.model.entity.catalogo.Ingrediente;
import com.totospizza.model.enums.TipoIngrediente;
import com.totospizza.repository.catalogo.IngredienteRepository;
import com.totospizza.service.catalogo.IngredienteService;

@Service
@RequiredArgsConstructor
@Transactional
public class IngredienteServiceImpl implements IngredienteService {

    private final IngredienteRepository ingredienteRepository;
    private final IngredienteMapper ingredienteMapper;

    @Override
    @Transactional(readOnly = true)
    public List<IngredienteResponse> listarDisponibles() {
        return ingredienteMapper.toResponses(ingredienteRepository
                .findByTipoInAndDisponibleTrueOrderByTipoAscNombreAsc(EnumSet.allOf(TipoIngrediente.class)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<IngredienteResponse> listar() {
        return ingredienteMapper.toResponses(ingredienteRepository.findAll());
    }

    @Override
    public IngredienteResponse crear(IngredienteRequest request) {
        return ingredienteMapper.toResponse(ingredienteRepository.save(ingredienteMapper.toEntity(request)));
    }

    @Override
    public IngredienteResponse actualizar(Long id, IngredienteRequest request) {
        Ingrediente ingrediente = ingrediente(id);
        ingredienteMapper.updateEntity(request, ingrediente);
        return ingredienteMapper.toResponse(ingrediente);
    }

    @Override
    public IngredienteResponse cambiarDisponibilidad(Long id, CambiarDisponibilidadRequest request) {
        Ingrediente ingrediente = ingrediente(id);
        ingrediente.setDisponible(request.disponible());
        return ingredienteMapper.toResponse(ingrediente);
    }

    private Ingrediente ingrediente(Long id) {
        return ingredienteRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Ingrediente", id));
    }
}
