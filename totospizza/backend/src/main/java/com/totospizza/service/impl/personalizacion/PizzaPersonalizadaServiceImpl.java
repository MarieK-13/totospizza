package com.totospizza.service.impl.personalizacion;

import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.request.personalizacion.PizzaPersonalizadaRequest;
import com.totospizza.dto.response.personalizacion.CotizacionPizzaResponse;
import com.totospizza.dto.response.personalizacion.OpcionesPersonalizacionResponse;
import com.totospizza.dto.response.personalizacion.PasoOpcionesResponse;
import com.totospizza.dto.response.personalizacion.PizzaPersonalizadaResponse;
import com.totospizza.exception.RecursoNoEncontradoException;
import com.totospizza.exception.ReglaNegocioException;
import com.totospizza.mapper.catalogo.IngredienteMapper;
import com.totospizza.mapper.catalogo.TamanoPizzaMapper;
import com.totospizza.mapper.catalogo.TipoMasaMapper;
import com.totospizza.mapper.personalizacion.PizzaPersonalizadaMapper;
import com.totospizza.model.entity.catalogo.Ingrediente;
import com.totospizza.model.entity.catalogo.TamanoPizza;
import com.totospizza.model.entity.catalogo.TipoMasa;
import com.totospizza.model.entity.personalizacion.PizzaPersonalizada;
import com.totospizza.model.entity.personalizacion.PizzaPersonalizadaIngrediente;
import com.totospizza.model.enums.PasoPersonalizacion;
import com.totospizza.model.enums.TipoIngrediente;
import com.totospizza.repository.catalogo.IngredienteRepository;
import com.totospizza.repository.catalogo.TamanoPizzaRepository;
import com.totospizza.repository.catalogo.TipoMasaRepository;
import com.totospizza.repository.personalizacion.PizzaPersonalizadaRepository;
import com.totospizza.repository.seguridad.UsuarioRepository;
import com.totospizza.rules.calculator.CalculadoraPizza;
import com.totospizza.service.personalizacion.PizzaPersonalizadaService;

@Service
@RequiredArgsConstructor
@Transactional
public class PizzaPersonalizadaServiceImpl implements PizzaPersonalizadaService {

    private static final String NOMBRE_POR_DEFECTO = "Mi pizza";
    private static final Set<TipoIngrediente> TIPOS_QUESO = EnumSet.of(TipoIngrediente.QUESO);
    private static final Set<TipoIngrediente> TIPOS_SALSA = EnumSet.of(TipoIngrediente.SALSA);
    private static final Set<TipoIngrediente> TIPOS_INGREDIENTE = EnumSet.of(TipoIngrediente.CARNE, TipoIngrediente.OTRO);

    private final PizzaPersonalizadaRepository pizzaRepository;
    private final TamanoPizzaRepository tamanoRepository;
    private final TipoMasaRepository tipoMasaRepository;
    private final IngredienteRepository ingredienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final PizzaPersonalizadaMapper pizzaMapper;
    private final TamanoPizzaMapper tamanoMapper;
    private final TipoMasaMapper tipoMasaMapper;
    private final IngredienteMapper ingredienteMapper;

    private record Seleccion(TamanoPizza tamano, TipoMasa masa, List<Ingrediente> quesos,
                             List<Ingrediente> salsas, List<Ingrediente> extras) {

        List<Ingrediente> todos() {
            List<Ingrediente> todos = new ArrayList<>(quesos);
            todos.addAll(salsas);
            todos.addAll(extras);
            return todos;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public OpcionesPersonalizacionResponse opciones() {
        return new OpcionesPersonalizacionResponse(
                tamanoMapper.toResponses(tamanoRepository.findAllByOrderByOrdenAsc()),
                tipoMasaMapper.toResponses(tipoMasaRepository.findByActivaTrueOrderByNombreAsc()),
                List.of(paso(PasoPersonalizacion.QUESO, TIPOS_QUESO),
                        paso(PasoPersonalizacion.SALSA, TIPOS_SALSA),
                        paso(PasoPersonalizacion.INGREDIENTES, TIPOS_INGREDIENTE)));
    }

    @Override
    @Transactional(readOnly = true)
    public CotizacionPizzaResponse cotizar(PizzaPersonalizadaRequest request) {
        Seleccion seleccion = resolver(request);
        return CalculadoraPizza.cotizar(seleccion.tamano(), seleccion.masa(), seleccion.todos());
    }

    @Override
    public PizzaPersonalizadaResponse guardar(Long usuarioId, PizzaPersonalizadaRequest request) {
        Seleccion seleccion = resolver(request);
        CotizacionPizzaResponse cotizacion = CalculadoraPizza.cotizar(seleccion.tamano(), seleccion.masa(), seleccion.todos());

        PizzaPersonalizada pizza = new PizzaPersonalizada();
        pizza.setUsuario(usuarioRepository.getReferenceById(usuarioId));
        pizza.setNombre(request.nombre() == null || request.nombre().isBlank() ? NOMBRE_POR_DEFECTO : request.nombre().trim());
        pizza.setTamano(seleccion.tamano());
        pizza.setTipoMasa(seleccion.masa());
        pizza.setPrecioTotal(cotizacion.total());
        agregar(pizza, seleccion.quesos(), PasoPersonalizacion.QUESO);
        agregar(pizza, seleccion.salsas(), PasoPersonalizacion.SALSA);
        agregar(pizza, seleccion.extras(), PasoPersonalizacion.INGREDIENTES);
        return pizzaMapper.toResponse(pizzaRepository.save(pizza));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PizzaPersonalizadaResponse> listar(Long usuarioId) {
        return pizzaRepository.findByUsuarioIdOrderByCreadoEnDesc(usuarioId).stream()
                .map(pizza -> pizzaRepository.findConDetalleById(pizza.getId()).orElse(pizza))
                .map(pizzaMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PizzaPersonalizadaResponse obtener(Long usuarioId, Long pizzaId) {
        return pizzaRepository.findConDetalleById(pizzaId)
                .filter(p -> p.getUsuario().getId().equals(usuarioId))
                .map(pizzaMapper::toResponse)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pizza personalizada", pizzaId));
    }

    private PasoOpcionesResponse paso(PasoPersonalizacion paso, Set<TipoIngrediente> tipos) {
        return new PasoOpcionesResponse(paso.getNumero(), paso.getEtiqueta(), paso.getMaxSelecciones(),
                ingredienteMapper.toResponses(
                        ingredienteRepository.findByTipoInAndDisponibleTrueOrderByTipoAscNombreAsc(tipos)));
    }

    private Seleccion resolver(PizzaPersonalizadaRequest request) {
        TamanoPizza tamano = tamanoRepository.findById(request.tamanoId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Tamaño", request.tamanoId()));
        TipoMasa masa = tipoMasaRepository.findById(request.tipoMasaId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Tipo de masa", request.tipoMasaId()));
        if (!masa.isActiva()) {
            throw new ReglaNegocioException("MASA_NO_DISPONIBLE", "La masa elegida ya no está disponible");
        }
        return new Seleccion(tamano, masa,
                ingredientes(request.quesoIds(), PasoPersonalizacion.QUESO, TIPOS_QUESO),
                ingredientes(request.salsaIds(), PasoPersonalizacion.SALSA, TIPOS_SALSA),
                ingredientes(request.ingredienteIds(), PasoPersonalizacion.INGREDIENTES, TIPOS_INGREDIENTE));
    }

    private List<Ingrediente> ingredientes(List<Long> pedidos, PasoPersonalizacion paso, Set<TipoIngrediente> tipos) {
        List<Long> ids = pedidos == null ? List.of() : pedidos.stream().distinct().toList();
        if (ids.size() > paso.getMaxSelecciones()) {
            throw new ReglaNegocioException("MAXIMO_EXCEDIDO",
                    "En \"" + paso.getEtiqueta() + "\" puedes elegir hasta " + paso.getMaxSelecciones());
        }
        if (ids.isEmpty()) {
            return List.of();
        }
        Map<Long, Ingrediente> encontrados = ingredienteRepository.findByIdInAndDisponibleTrue(ids).stream()
                .collect(Collectors.toMap(Ingrediente::getId, Function.identity()));
        return ids.stream().map(id -> {
            Ingrediente ingrediente = encontrados.get(id);
            if (ingrediente == null || !tipos.contains(ingrediente.getTipo())) {
                throw new ReglaNegocioException("INGREDIENTE_INVALIDO",
                        "Uno de los ingredientes elegidos no está disponible para \"" + paso.getEtiqueta() + "\"");
            }
            return ingrediente;
        }).toList();
    }

    private static void agregar(PizzaPersonalizada pizza, List<Ingrediente> ingredientes, PasoPersonalizacion paso) {
        for (Ingrediente ingrediente : ingredientes) {
            PizzaPersonalizadaIngrediente elegido = new PizzaPersonalizadaIngrediente();
            elegido.setPizza(pizza);
            elegido.setIngrediente(ingrediente);
            elegido.setPaso(paso);
            elegido.setPrecioAplicado(ingrediente.getPrecioExtra());
            pizza.getIngredientes().add(elegido);
        }
    }
}
