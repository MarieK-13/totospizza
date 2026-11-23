package com.totospizza.service.impl.catalogo;

import java.time.Clock;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.request.catalogo.CambiarDisponibilidadRequest;
import com.totospizza.dto.request.catalogo.PromocionItemRequest;
import com.totospizza.dto.request.catalogo.PromocionRequest;
import com.totospizza.dto.response.catalogo.PromocionResponse;
import com.totospizza.exception.RecursoNoEncontradoException;
import com.totospizza.exception.ReglaNegocioException;
import com.totospizza.mapper.catalogo.PromocionMapper;
import com.totospizza.model.entity.catalogo.Promocion;
import com.totospizza.model.entity.catalogo.PromocionItem;
import com.totospizza.model.enums.Rol;
import com.totospizza.model.enums.TipoNotificacion;
import com.totospizza.model.enums.TipoPromocion;
import com.totospizza.repository.catalogo.ProductoRepository;
import com.totospizza.repository.catalogo.PromocionRepository;
import com.totospizza.repository.catalogo.TamanoPizzaRepository;
import com.totospizza.service.catalogo.PromocionService;
import com.totospizza.service.operacion.NotificacionService;

@Service
@RequiredArgsConstructor
@Transactional
public class PromocionServiceImpl implements PromocionService {

    private final PromocionRepository promocionRepository;
    private final ProductoRepository productoRepository;
    private final TamanoPizzaRepository tamanoRepository;
    private final PromocionMapper promocionMapper;
    private final NotificacionService notificacionService;
    private final Clock clock;

    @Override
    @Transactional(readOnly = true)
    public List<PromocionResponse> vigentes() {
        return promocionMapper.toResponses(promocionRepository.findVigentes(Instant.now(clock)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PromocionResponse> listar() {
        return promocionMapper.toResponses(promocionRepository.findAll().stream()
                .sorted(Comparator.comparing(Promocion::getOrden, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(Promocion::getId))
                .toList());
    }

    @Override
    public PromocionResponse crear(PromocionRequest request) {
        validarVigencia(request);
        Promocion promocion = promocionMapper.toEntity(request);
        sincronizarItems(promocion, request.items());
        promocionRepository.save(promocion);
        alertarSiHayPerdida(promocion);
        return promocionMapper.toResponse(promocion);
    }

    @Override
    public PromocionResponse actualizar(Long id, PromocionRequest request) {
        validarVigencia(request);
        Promocion promocion = promocion(id);
        promocionMapper.updateEntity(request, promocion);
        sincronizarItems(promocion, request.items());
        alertarSiHayPerdida(promocion);
        return promocionMapper.toResponse(promocion);
    }

    @Override
    public PromocionResponse cambiarActiva(Long id, CambiarDisponibilidadRequest request) {
        Promocion promocion = promocion(id);
        promocion.setActiva(request.disponible());
        return promocionMapper.toResponse(promocion);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PromocionResponse> enPerdida() {
        return promocionMapper.toResponses(promocionRepository.findEnPerdida(TipoPromocion.OFERTA_FLASH));
    }

    private static void validarVigencia(PromocionRequest request) {
        if (!request.vigenteHasta().isAfter(request.vigenteDesde())) {
            throw new ReglaNegocioException("VIGENCIA_INVALIDA", "La promoción debe terminar después de que empieza");
        }
    }

    private void sincronizarItems(Promocion promocion, List<PromocionItemRequest> pedidos) {
        promocion.getItems().clear();
        for (PromocionItemRequest pedido : pedidos) {
            PromocionItem item = new PromocionItem();
            item.setPromocion(promocion);
            item.setProducto(productoRepository.findById(pedido.productoId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Producto", pedido.productoId())));
            if (pedido.tamanoId() != null) {
                item.setTamano(tamanoRepository.findById(pedido.tamanoId())
                        .orElseThrow(() -> new RecursoNoEncontradoException("Tamaño", pedido.tamanoId())));
            }
            item.setCantidad(pedido.cantidad());
            promocion.getItems().add(item);
        }
    }

    private void alertarSiHayPerdida(Promocion promocion) {
        boolean enPerdida = promocion.getTipo() == TipoPromocion.OFERTA_FLASH
                && promocion.isActiva()
                && promocion.getCostoEstimado() != null
                && promocion.getPrecioPromocional().compareTo(promocion.getCostoEstimado()) < 0;
        if (enPerdida) {
            notificacionService.notificarRol(Rol.ADMINISTRADOR, TipoNotificacion.ALERTA_OFERTA_FLASH,
                    "Oferta flash con pérdida",
                    "\"" + promocion.getTitulo() + "\" se vende a S/ " + promocion.getPrecioPromocional()
                            + " y su costo estimado es S/ " + promocion.getCostoEstimado() + ".");
        }
    }

    private Promocion promocion(Long id) {
        return promocionRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Promoción", id));
    }
}
