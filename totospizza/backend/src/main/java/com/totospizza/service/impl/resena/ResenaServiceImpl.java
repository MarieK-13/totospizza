package com.totospizza.service.impl.resena;

import java.time.Clock;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.common.PageResponse;
import com.totospizza.dto.request.catalogo.CambiarDisponibilidadRequest;
import com.totospizza.dto.request.resena.CalificacionProductoRequest;
import com.totospizza.dto.request.resena.ResenaRequest;
import com.totospizza.dto.response.resena.ResenaResponse;
import com.totospizza.dto.response.resena.ResumenCalificacionResponse;
import com.totospizza.exception.ConflictoException;
import com.totospizza.exception.RecursoNoEncontradoException;
import com.totospizza.exception.ReglaNegocioException;
import com.totospizza.mapper.MapeoUtils;
import com.totospizza.mapper.resena.ResenaMapper;
import com.totospizza.model.entity.catalogo.Producto;
import com.totospizza.model.entity.pedido.Pedido;
import com.totospizza.model.entity.resena.CalificacionProducto;
import com.totospizza.model.entity.resena.Resena;
import com.totospizza.model.enums.EstadoPedido;
import com.totospizza.repository.catalogo.ProductoRepository;
import com.totospizza.repository.pedido.PedidoRepository;
import com.totospizza.repository.resena.CalificacionProductoRepository;
import com.totospizza.repository.resena.ResenaRepository;
import com.totospizza.repository.resena.projection.ResumenCalificacion;
import com.totospizza.repository.seguridad.UsuarioRepository;
import com.totospizza.service.resena.ResenaService;

@Service
@RequiredArgsConstructor
@Transactional
public class ResenaServiceImpl implements ResenaService {

    private final ResenaRepository resenaRepository;
    private final CalificacionProductoRepository calificacionRepository;
    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ResenaMapper resenaMapper;
    private final Clock clock;

    @Override
    public ResenaResponse crear(Long usuarioId, ResenaRequest request) {
        Pedido pedido = pedidoRepository.findConDetalleById(request.pedidoId())
                .filter(p -> p.getCliente().getId().equals(usuarioId))
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido", request.pedidoId()));
        if (pedido.getEstado() != EstadoPedido.ENTREGADO) {
            throw new ReglaNegocioException("PEDIDO_NO_ENTREGADO", "Solo puedes opinar sobre pedidos entregados");
        }
        if (resenaRepository.existsByPedidoId(pedido.getId())) {
            throw new ConflictoException("RESENA_EXISTENTE", "Ya dejaste una reseña para este pedido");
        }

        Resena resena = resenaMapper.toEntity(request);
        resena.setUsuario(usuarioRepository.getReferenceById(usuarioId));
        resena.setPedido(pedido);
        agregarCalificaciones(resena, pedido, request.calificaciones());
        resenaRepository.save(resena);

        // La respuesta se arma antes de actualizar los promedios: esas actualizaciones limpian el contexto.
        ResenaResponse respuesta = resenaMapper.toResponse(resena);
        actualizarPromedios(resena.getCalificaciones().stream().map(c -> c.getProducto().getId()).distinct().toList());
        return respuesta;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResenaResponse> destacadas(int limite) {
        return resenaMapper.toResponses(resenaRepository
                .findByDestacadaTrueAndVisibleTrueOrderByCreadoEnDesc(PageRequest.of(0, limite)));
    }

    @Override
    @Transactional(readOnly = true)
    public ResumenCalificacionResponse resumenProducto(Long productoId) {
        return resenaMapper.toResumen(calificacionRepository.resumenDeProducto(productoId));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ResenaResponse> listar(Pageable pageable) {
        return PageResponse.of(resenaRepository.findAll(pageable).map(resenaMapper::toResponse));
    }

    @Override
    public ResenaResponse cambiarDestacada(Long id, CambiarDisponibilidadRequest request) {
        Resena resena = resena(id);
        resena.setDestacada(request.disponible());
        return resenaMapper.toResponse(resena);
    }

    @Override
    public ResenaResponse cambiarVisible(Long id, CambiarDisponibilidadRequest request) {
        Resena resena = resena(id);
        resena.setVisible(request.disponible());
        if (!request.disponible()) {
            resena.setDestacada(false);
        }
        return resenaMapper.toResponse(resena);
    }

    /** Solo se puede calificar un producto que el cliente realmente compró en ese pedido, una vez cada uno. */
    private void agregarCalificaciones(Resena resena, Pedido pedido, List<CalificacionProductoRequest> pedidas) {
        if (pedidas == null || pedidas.isEmpty()) {
            return;
        }
        Map<Long, Producto> comprados = pedido.getDetalles().stream()
                .map(d -> d.getProducto())
                .filter(p -> p != null)
                .collect(Collectors.toMap(Producto::getId, Function.identity(), (a, b) -> a));
        Set<Long> vistos = new HashSet<>();
        for (CalificacionProductoRequest pedida : pedidas) {
            Producto producto = comprados.get(pedida.productoId());
            if (producto == null) {
                throw new ReglaNegocioException("PRODUCTO_AJENO", "Solo puedes calificar productos de este pedido");
            }
            if (!vistos.add(producto.getId())) {
                throw new ReglaNegocioException("CALIFICACION_REPETIDA", "Un producto solo se califica una vez");
            }
            CalificacionProducto calificacion = new CalificacionProducto();
            calificacion.setResena(resena);
            calificacion.setProducto(producto);
            calificacion.setEstrellas(pedida.estrellas());
            resena.getCalificaciones().add(calificacion);
        }
    }

    /** Recalcula el promedio y el total que se muestran en el menú. Limpia el contexto de persistencia. */
    private void actualizarPromedios(List<Long> productoIds) {
        Instant ahora = Instant.now(clock);
        for (Long productoId : productoIds) {
            ResumenCalificacion resumen = calificacionRepository.resumenDeProducto(productoId);
            productoRepository.actualizarCalificacion(productoId, MapeoUtils.promedio(resumen.getPromedio()),
                    resumen.getTotal().intValue(), ahora);
        }
    }

    private Resena resena(Long id) {
        return resenaRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Reseña", id));
    }
}
