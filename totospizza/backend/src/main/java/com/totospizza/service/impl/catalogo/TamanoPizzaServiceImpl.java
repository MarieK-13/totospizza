package com.totospizza.service.impl.catalogo;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.request.catalogo.CambiarDisponibilidadRequest;
import com.totospizza.dto.request.catalogo.TamanoPizzaRequest;
import com.totospizza.dto.response.catalogo.TamanoPizzaResponse;
import com.totospizza.exception.ConflictoException;
import com.totospizza.exception.RecursoNoEncontradoException;
import com.totospizza.exception.ReglaNegocioException;
import com.totospizza.mapper.catalogo.TamanoPizzaMapper;
import com.totospizza.model.entity.catalogo.TamanoPizza;
import com.totospizza.repository.catalogo.TamanoPizzaRepository;
import com.totospizza.service.catalogo.TamanoPizzaService;

/**
 * Los tamaños no se eliminan porque los usan pedidos ya hechos; se desactivan.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class TamanoPizzaServiceImpl implements TamanoPizzaService {

    private final TamanoPizzaRepository tamanoRepository;
    private final TamanoPizzaMapper tamanoMapper;

    @Override
    @Transactional(readOnly = true)
    public List<TamanoPizzaResponse> listar() {
        return tamanoMapper.toResponses(tamanoRepository.findAllByOrderByOrdenAsc());
    }

    @Override
    public TamanoPizzaResponse crear(TamanoPizzaRequest request) {
        validar(request);
        String nombre = request.nombre().trim();
        if (tamanoRepository.existsByNombreIgnoreCase(nombre)) {
            throw duplicado(nombre);
        }
        TamanoPizza tamano = tamanoMapper.toEntity(request);
        tamano.setNombre(nombre);
        return tamanoMapper.toResponse(tamanoRepository.save(tamano));
    }

    @Override
    public TamanoPizzaResponse actualizar(Long id, TamanoPizzaRequest request) {
        validar(request);
        TamanoPizza tamano = tamano(id);
        String nombre = request.nombre().trim();
        if (tamanoRepository.existsByNombreIgnoreCaseAndIdNot(nombre, id)) {
            throw duplicado(nombre);
        }
        tamanoMapper.updateEntity(request, tamano);
        tamano.setNombre(nombre);
        return tamanoMapper.toResponse(tamano);
    }

    @Override
    public TamanoPizzaResponse cambiarActivo(Long id, CambiarDisponibilidadRequest request) {
        TamanoPizza tamano = tamano(id);
        tamano.setActivo(request.disponible());
        return tamanoMapper.toResponse(tamano);
    }

    private static void validar(TamanoPizzaRequest request) {
        if (request.personasMin() > request.personasMax()) {
            throw new ReglaNegocioException("PERSONAS_INVALIDAS",
                    "El mínimo de personas no puede ser mayor que el máximo");
        }
    }

    private TamanoPizza tamano(Long id) {
        return tamanoRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Tamaño", id));
    }

    private static ConflictoException duplicado(String nombre) {
        return new ConflictoException("TAMANO_DUPLICADO", "Ya existe un tamaño llamado \"" + nombre + "\"");
    }
}
