package com.totospizza.service.impl.operacion;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import com.totospizza.constant.ParametroClaves;
import com.totospizza.dto.request.operacion.AjusteInventarioRequest;
import com.totospizza.dto.response.operacion.InventarioIngredienteResponse;
import com.totospizza.exception.ConflictoException;
import com.totospizza.exception.RecursoNoEncontradoException;
import com.totospizza.exception.ReglaNegocioException;
import com.totospizza.mapper.operacion.InventarioMapper;
import com.totospizza.model.entity.operacion.InventarioIngrediente;
import com.totospizza.model.entity.operacion.MovimientoInventario;
import com.totospizza.model.entity.pedido.Pedido;
import com.totospizza.model.entity.sucursal.Sucursal;
import com.totospizza.model.enums.CanalInventario;
import com.totospizza.model.enums.Rol;
import com.totospizza.model.enums.TipoMovimientoInventario;
import com.totospizza.model.enums.TipoNotificacion;
import com.totospizza.model.enums.UnidadMedida;
import com.totospizza.repository.catalogo.IngredienteRepository;
import com.totospizza.repository.operacion.InventarioIngredienteRepository;
import com.totospizza.repository.operacion.MovimientoInventarioRepository;
import com.totospizza.repository.seguridad.UsuarioRepository;
import com.totospizza.repository.sucursal.SucursalRepository;
import com.totospizza.rules.calculator.CalculadoraMasas;
import com.totospizza.service.configuracion.ParametrosService;
import com.totospizza.service.operacion.InventarioService;
import com.totospizza.service.operacion.NotificacionService;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class InventarioServiceImpl implements InventarioService {

    private static final String MENSAJE_SIN_MASAS = "Ya no quedan masas disponibles para pedidos online";

    private final InventarioIngredienteRepository inventarioRepository;
    private final MovimientoInventarioRepository movimientoRepository;
    private final SucursalRepository sucursalRepository;
    private final IngredienteRepository ingredienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final InventarioMapper inventarioMapper;
    private final ParametrosService parametros;
    private final NotificacionService notificacionService;
    private final Clock clock;

    @Override
    @Transactional(readOnly = true)
    public List<InventarioIngredienteResponse> listar(Long sucursalId, CanalInventario canal) {
        return inventarioMapper.toResponses(
                inventarioRepository.findBySucursalIdAndCanalOrderByIngredienteNombreAsc(sucursalId, canal));
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventarioIngredienteResponse> stockBajo(Long sucursalId, CanalInventario canal) {
        return inventarioMapper.toResponses(inventarioRepository.findStockBajo(sucursalId, canal));
    }

    @Override
    @Transactional(readOnly = true)
    public long contarStockBajo(Long sucursalId) {
        List<Long> sucursalIds = sucursalId != null
                ? List.of(sucursalId)
                : sucursalRepository.findAll().stream().map(s -> s.getId()).toList();
        return sucursalIds.stream()
                .mapToLong(id -> EnumSet.allOf(CanalInventario.class).stream()
                        .mapToLong(canal -> inventarioRepository.findStockBajo(id, canal).size())
                        .sum())
                .sum();
    }

    @Override
    public InventarioIngredienteResponse ajustar(Long inventarioId, Long usuarioId, AjusteInventarioRequest request) {
        InventarioIngrediente inventario = inventarioRepository.findById(inventarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Inventario", inventarioId));
        BigDecimal anterior = inventario.getStockActual();
        BigDecimal cantidad = request.cantidad();
        Instant ahora = Instant.now(clock);

        switch (request.tipo()) {
            case ENTRADA -> inventarioRepository.reponerStock(inventarioId, cantidad, ahora);
            case SALIDA, MERMA -> {
                if (inventarioRepository.descontarStock(inventarioId, cantidad, ahora) == 0) {
                    throw new ReglaNegocioException("STOCK_INSUFICIENTE", "No hay stock suficiente para ese movimiento");
                }
            }
            case AJUSTE -> inventario.setStockActual(cantidad);
        }

        registrarMovimiento(inventarioId, request.tipo(), cantidad, request.motivo(), null, usuarioId);
        InventarioIngrediente actualizado = inventarioRepository.findById(inventarioId).orElseThrow();
        alertarSiCruzoMinimo(anterior, actualizado);
        return inventarioMapper.toResponse(actualizado);
    }

    @Override
    public void inicializarStockWeb(Sucursal sucursal) {
        parametros.idOpcional(ParametroClaves.INGREDIENTE_MASA_ID).ifPresentOrElse(masaId -> {
            boolean existe = inventarioRepository
                    .findByIngredienteIdAndSucursalIdAndCanal(masaId, sucursal.getId(), CanalInventario.ONLINE)
                    .isPresent();
            if (!existe) {
                InventarioIngrediente fila = new InventarioIngrediente();
                fila.setIngrediente(ingredienteRepository.getReferenceById(masaId));
                fila.setSucursal(sucursal);
                fila.setCanal(CanalInventario.ONLINE);
                fila.setUnidad(UnidadMedida.UNIDAD);
                inventarioRepository.save(fila);
            }
        }, () -> log.warn("Sin parámetro {}: la sucursal {} no tendrá stock web de masas hasta configurarlo",
                ParametroClaves.INGREDIENTE_MASA_ID, sucursal.getNombre()));
    }

    @Override
    public void reservarStockWeb(Pedido pedido) {
        int unidades = CalculadoraMasas.unidades(pedido.getDetalles());
        if (unidades == 0) {
            return;
        }
        Long masaId = parametros.idOpcional(ParametroClaves.INGREDIENTE_MASA_ID)
                .orElseThrow(() -> new ReglaNegocioException("STOCK_WEB_NO_CONFIGURADO",
                        "Falta configurar el ingrediente de masa del stock web (parámetro "
                                + ParametroClaves.INGREDIENTE_MASA_ID + ")"));
        InventarioIngrediente inventario = stockWeb(masaId, pedido)
                .orElseThrow(() -> new ReglaNegocioException("STOCK_WEB_NO_CONFIGURADO",
                        "La sucursal " + pedido.getSucursal().getNombre()
                                + " no tiene stock web de masas configurado"));
        BigDecimal anterior = inventario.getStockActual();
        Long inventarioId = inventario.getId();

        if (inventarioRepository.descontarStock(inventarioId, BigDecimal.valueOf(unidades), Instant.now(clock)) == 0) {
            throw new ConflictoException("STOCK_WEB_AGOTADO", MENSAJE_SIN_MASAS);
        }
        registrarMovimiento(inventarioId, TipoMovimientoInventario.SALIDA, BigDecimal.valueOf(unidades),
                "Pedido " + pedido.getNumero(), pedido, null);
        alertarSiCruzoMinimo(anterior, inventarioRepository.findById(inventarioId).orElseThrow());
    }

    @Override
    public void reponerStockWeb(Pedido pedido) {
        int unidades = CalculadoraMasas.unidades(pedido.getDetalles());
        if (unidades == 0) {
            return;
        }
        Optional<InventarioIngrediente> fila = parametros.idOpcional(ParametroClaves.INGREDIENTE_MASA_ID)
                .flatMap(masaId -> stockWeb(masaId, pedido));
        if (fila.isEmpty()) {
            log.warn("No se pudieron devolver {} masas del pedido {}: no hay fila de stock web", unidades,
                    pedido.getNumero());
            return;
        }
        Long inventarioId = fila.get().getId();
        inventarioRepository.reponerStock(inventarioId, BigDecimal.valueOf(unidades), Instant.now(clock));
        registrarMovimiento(inventarioId, TipoMovimientoInventario.ENTRADA, BigDecimal.valueOf(unidades),
                "Pedido " + pedido.getNumero() + " cancelado", pedido, null);
    }

    private Optional<InventarioIngrediente> stockWeb(Long ingredienteId, Pedido pedido) {
        return inventarioRepository.findByIngredienteIdAndSucursalIdAndCanal(
                ingredienteId, pedido.getSucursal().getId(), CanalInventario.ONLINE);
    }

    private void registrarMovimiento(Long inventarioId, TipoMovimientoInventario tipo, BigDecimal cantidad,
                                     String motivo, Pedido pedido, Long usuarioId) {
        MovimientoInventario movimiento = new MovimientoInventario();
        movimiento.setInventario(inventarioRepository.getReferenceById(inventarioId));
        movimiento.setTipo(tipo);
        movimiento.setCantidad(cantidad);
        movimiento.setMotivo(motivo);
        movimiento.setPedido(pedido);
        movimiento.setRegistradoPor(usuarioId == null ? null : usuarioRepository.getReferenceById(usuarioId));
        movimientoRepository.save(movimiento);
    }

    /** Avisa solo al cruzar el mínimo, no en cada venta posterior, para no llenar de alertas al administrador. */
    private void alertarSiCruzoMinimo(BigDecimal anterior, InventarioIngrediente actual) {
        boolean cruzo = anterior.compareTo(actual.getStockMinimo()) > 0
                && actual.getStockActual().compareTo(actual.getStockMinimo()) <= 0;
        if (cruzo) {
            notificacionService.notificarRol(Rol.ADMINISTRADOR, TipoNotificacion.STOCK_BAJO,
                    "Stock bajo: " + actual.getIngrediente().getNombre(),
                    "Quedan " + actual.getStockActual().stripTrailingZeros().toPlainString() + " "
                            + actual.getUnidad().getEtiqueta() + " (" + actual.getCanal().getEtiqueta() + ") en "
                            + actual.getSucursal().getNombre() + ".");
        }
    }
}
