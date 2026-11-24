package com.totospizza.service.impl.pedido;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import com.totospizza.constant.ParametroClaves;
import com.totospizza.dto.common.PageResponse;
import com.totospizza.dto.request.pedido.CancelarPedidoRequest;
import com.totospizza.dto.request.pedido.CheckoutRequest;
import com.totospizza.dto.request.sucursal.ConsultaCoberturaRequest;
import com.totospizza.dto.response.pago.PagoResponse;
import com.totospizza.dto.response.pedido.CheckoutResponse;
import com.totospizza.dto.response.pedido.PedidoResponse;
import com.totospizza.dto.response.pedido.PedidoResumenResponse;
import com.totospizza.dto.response.pedido.ResumenMontosResponse;
import com.totospizza.dto.response.pedido.SeguimientoResponse;
import com.totospizza.dto.response.sucursal.CoberturaResponse;
import com.totospizza.exception.RecursoNoEncontradoException;
import com.totospizza.exception.ReglaNegocioException;
import com.totospizza.mapper.MapeoUtils;
import com.totospizza.mapper.pedido.PedidoMapper;
import com.totospizza.mapper.seguridad.DireccionMapper;
import com.totospizza.model.entity.operacion.Entrega;
import com.totospizza.model.entity.pedido.Carrito;
import com.totospizza.model.entity.pedido.DetallePedido;
import com.totospizza.model.entity.pedido.DetallePedidoAdicional;
import com.totospizza.model.entity.pedido.ItemCarrito;
import com.totospizza.model.entity.pedido.ItemCarritoAdicional;
import com.totospizza.model.entity.pedido.Pedido;
import com.totospizza.model.entity.sucursal.Sucursal;
import com.totospizza.model.enums.EstadoCarrito;
import com.totospizza.model.enums.EstadoPedido;
import com.totospizza.model.enums.Rol;
import com.totospizza.model.enums.TipoEntrega;
import com.totospizza.model.enums.TipoNotificacion;
import com.totospizza.repository.operacion.EntregaRepository;
import com.totospizza.repository.pedido.CarritoRepository;
import com.totospizza.repository.pedido.PedidoEstadoHistorialRepository;
import com.totospizza.repository.pedido.PedidoRepository;
import com.totospizza.repository.seguridad.UsuarioRepository;
import com.totospizza.repository.sucursal.SucursalRepository;
import com.totospizza.rules.calculator.CalculadoraCarrito;
import com.totospizza.rules.calculator.CalculadoraMontos;
import com.totospizza.rules.calculator.CalculadoraSeguimiento;
import com.totospizza.rules.generator.NumeroPedidoGenerator;
import com.totospizza.rules.policy.HorarioPolicy;
import com.totospizza.service.configuracion.ParametrosService;
import com.totospizza.service.operacion.InventarioService;
import com.totospizza.service.operacion.NotificacionService;
import com.totospizza.service.pago.PagoService;
import com.totospizza.service.pedido.PedidoEstadoService;
import com.totospizza.service.pedido.PedidoService;
import com.totospizza.service.sucursal.SucursalService;
import com.totospizza.util.FechaUtil;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PedidoServiceImpl implements PedidoService {

    private static final int DIAS_BUSQUEDA_POR_DEFECTO = 30;
    private static final String PAGO_RECHAZADO = "PAGO_RECHAZADO";

    private final PedidoRepository pedidoRepository;
    private final CarritoRepository carritoRepository;
    private final SucursalRepository sucursalRepository;
    private final UsuarioRepository usuarioRepository;
    private final PedidoEstadoHistorialRepository historialRepository;
    private final EntregaRepository entregaRepository;
    private final PedidoMapper pedidoMapper;
    private final DireccionMapper direccionMapper;
    private final PedidoAssembler pedidoAssembler;
    private final NumeroPedidoGenerator numeroGenerator;
    private final PedidoEstadoService pedidoEstadoService;
    private final InventarioService inventarioService;
    private final NotificacionService notificacionService;
    private final PagoService pagoService;
    private final SucursalService sucursalService;
    private final ParametrosService parametros;
    private final TransactionTemplate transaccion;
    private final Clock clock;

    @Override
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public CheckoutResponse checkout(Long usuarioId, CheckoutRequest request) {
        pagoService.validarMetodo(request.pago());
        Long pedidoId = transaccion.execute(estado -> crearPedidoPendiente(usuarioId, request));

        PagoResponse pago;
        try {
            pago = pagoService.cobrar(usuarioId, pedidoId, request.pago());
        } catch (ReglaNegocioException e) {
            if (PAGO_RECHAZADO.equals(e.getCodigo())) {
                cancelarPorFalloDePago(pedidoId, usuarioId);
            }
            throw e; 
        }
        return transaccion.execute(estado -> cerrarCheckout(usuarioId, pedidoId, pago));
    }

    private Long crearPedidoPendiente(Long usuarioId, CheckoutRequest request) {
        Carrito carrito = carritoRepository.findByUsuarioIdAndEstado(usuarioId, EstadoCarrito.ACTIVO)
                .filter(c -> !c.getItems().isEmpty())
                .orElseThrow(() -> new ReglaNegocioException("CARRITO_VACIO", "Tu carrito está vacío"));
        Sucursal sucursal = sucursalAbierta(request.sucursalId());
        boolean delivery = request.tipoEntrega() == TipoEntrega.DELIVERY;

        BigDecimal costoZona = null;
        int minutos = parametros.entero(ParametroClaves.MINUTOS_PREPARACION, ParametroClaves.MINUTOS_PREPARACION_DEFECTO);
        if (delivery) {
            CoberturaResponse cobertura = validarCobertura(request);
            costoZona = cobertura.costoEnvio();
            minutos = cobertura.minutosEstimados();
        }

        ResumenMontosResponse montos = CalculadoraMontos.calcular(
                CalculadoraCarrito.subtotal(carrito.getItems()), request.tipoEntrega(), costoZona,
                parametros.numero(ParametroClaves.COSTO_DELIVERY_BASE, ParametroClaves.COSTO_DELIVERY_BASE_DEFECTO),
                parametros.numero(ParametroClaves.ENVIO_GRATIS_DESDE, ParametroClaves.ENVIO_GRATIS_DESDE_DEFECTO),
                BigDecimal.ZERO);

        Pedido pedido = new Pedido();
        pedido.setNumero(numeroGenerator.siguiente());
        pedido.setCliente(usuarioRepository.getReferenceById(usuarioId));
        pedido.setSucursal(sucursal);
        pedido.setTipoEntrega(request.tipoEntrega());
        pedido.setEstado(EstadoPedido.PENDIENTE_PAGO);
        pedido.setDireccionEntrega(delivery ? direccionMapper.toEntity(request.direccionEntrega()) : null);
        pedido.setInstrucciones(request.instrucciones());
        pedido.setSubtotal(montos.subtotal());
        pedido.setCostoDelivery(montos.costoDelivery());
        pedido.setDescuento(montos.descuento());
        pedido.setTotal(montos.total());
        pedido.setMinutosEstimados(minutos);
        carrito.getItems().forEach(item -> pedido.getDetalles().add(detalle(pedido, item)));

        pedidoRepository.save(pedido);
        pedidoEstadoService.registrarCreacion(pedido);
        inventarioService.reservarStockWeb(pedido);
        return pedido.getId();
    }

    private Sucursal sucursalAbierta(Long sucursalId) {
        Sucursal sucursal = sucursalRepository.findById(sucursalId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Sucursal", sucursalId));
        if (!sucursal.isActiva()) {
            throw new ReglaNegocioException("SUCURSAL_INACTIVA", "La sucursal elegida no está disponible");
        }
        if (!HorarioPolicy.abierta(sucursal, LocalDateTime.now(clock))) {
            throw new ReglaNegocioException("SUCURSAL_CERRADA", "La sucursal está cerrada en este momento");
        }
        return sucursal;
    }

    private CoberturaResponse validarCobertura(CheckoutRequest request) {
        if (request.direccionEntrega() == null) {
            throw new ReglaNegocioException("DIRECCION_REQUERIDA", "Indica la dirección de entrega");
        }
        CoberturaResponse cobertura = sucursalService.consultarCobertura(new ConsultaCoberturaRequest(
                request.direccionEntrega().latitud(), request.direccionEntrega().longitud(), request.sucursalId()));
        if (!cobertura.dentroCobertura()) {
            throw new ReglaNegocioException("FUERA_DE_COBERTURA", cobertura.mensaje());
        }
        return cobertura;
    }

    private DetallePedido detalle(Pedido pedido, ItemCarrito item) {
        DetallePedido detalle = new DetallePedido();
        detalle.setPedido(pedido);
        detalle.setProducto(item.getProducto());
        detalle.setPizzaPersonalizada(item.getPizzaPersonalizada());
        detalle.setPromocion(item.getPromocion());
        detalle.setNombre(MapeoUtils.nombreItem(item));
        detalle.setDescripcion(descripcionDeCocina(item));
        detalle.setCantidad(item.getCantidad());
        detalle.setPrecioUnitario(item.getPrecioUnitario());
        detalle.setSubtotal(CalculadoraCarrito.subtotalItem(item));
        detalle.setNotas(item.getNotas());
        item.getAdicionales().forEach(adicional -> detalle.getAdicionales().add(adicional(detalle, adicional)));
        return detalle;
    }

    private static DetallePedidoAdicional adicional(DetallePedido detalle, ItemCarritoAdicional origen) {
        DetallePedidoAdicional adicional = new DetallePedidoAdicional();
        adicional.setDetalle(detalle);
        adicional.setIngrediente(origen.getIngrediente());
        adicional.setNombre(origen.getIngrediente().getNombre());
        adicional.setCantidad(origen.getCantidad());
        adicional.setPrecioUnitario(origen.getPrecioUnitario());
        return adicional;
    }

    private static String descripcionDeCocina(ItemCarrito item) {
        String texto = Stream.of(
                        item.getTamano() == null ? null : item.getTamano().getNombre(),
                        item.getTipoMasa() == null ? null : item.getTipoMasa().getNombre())
                .filter(parte -> parte != null && !parte.isBlank())
                .collect(Collectors.joining(" · "));
        return texto.isEmpty() ? null : texto;
    }

    private void cancelarPorFalloDePago(Long pedidoId, Long usuarioId) {
        try {
            transaccion.executeWithoutResult(estado ->
                    pedidoEstadoService.cancelar(pedidoId, usuarioId, "Pago no completado"));
        } catch (RuntimeException e) {
            log.error("No se pudo cancelar el pedido {} tras un pago fallido", pedidoId, e);
        }
    }

    private CheckoutResponse cerrarCheckout(Long usuarioId, Long pedidoId, PagoResponse pago) {
        carritoRepository.findByUsuarioIdAndEstado(usuarioId, EstadoCarrito.ACTIVO)
                .ifPresent(carrito -> carrito.setEstado(EstadoCarrito.CONVERTIDO));
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido", pedidoId));
        return new CheckoutResponse(pedido.getId(), pedido.getNumero(), pedido.getEstado(), pago.estado(),
                pedido.getTotal(), pedido.getMinutosEstimados());
    }

    @Override
    public PageResponse<PedidoResumenResponse> misPedidos(Long usuarioId, Pageable pageable) {
        return PageResponse.of(pedidoRepository.findByClienteId(usuarioId, pageable).map(pedidoMapper::toResumen));
    }

    @Override
    public PedidoResponse detalle(Long usuarioId, String numero) {
        return pedidoAssembler.respuesta(pedidoPropio(usuarioId, numero));
    }

    @Override
    public SeguimientoResponse seguimiento(Long usuarioId, String numero) {
        Pedido pedido = pedidoPropio(usuarioId, numero);
        Entrega entrega = entregaRepository.findByPedidoId(pedido.getId()).orElse(null);
        return CalculadoraSeguimiento.construir(pedido,
                historialRepository.findByPedidoIdOrderByCreadoEnAsc(pedido.getId()), entrega, Instant.now(clock));
    }

    private Pedido pedidoPropio(Long usuarioId, String numero) {
        return pedidoRepository.findByNumeroAndClienteId(numero, usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido", numero));
    }

    @Override
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public PedidoResponse cancelar(Long usuarioId, String numero, CancelarPedidoRequest request) {
        Long pedidoId = transaccion.execute(estado -> pedidoPropio(usuarioId, numero).getId());
        return cancelarYReembolsar(pedidoId, usuarioId, request.motivo());
    }

    @Override
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public PedidoResponse cancelarAdmin(Long adminId, Long pedidoId, CancelarPedidoRequest request) {
        return cancelarYReembolsar(pedidoId, adminId, request.motivo());
    }

    private PedidoResponse cancelarYReembolsar(Long pedidoId, Long usuarioId, String motivo) {
        transaccion.executeWithoutResult(estado -> pedidoEstadoService.cancelar(pedidoId, usuarioId, motivo));
        reembolsarOAvisar(pedidoId, motivo);
        return transaccion.execute(estado -> pedidoAssembler.respuesta(pedidoRepository.findConDetalleById(pedidoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido", pedidoId))));
    }

    private void reembolsarOAvisar(Long pedidoId, String motivo) {
        try {
            pagoService.reembolsarCancelacion(pedidoId, motivo);
        } catch (RuntimeException e) {
            log.error("Reembolso pendiente del pedido {}", pedidoId, e);
            transaccion.executeWithoutResult(estado -> notificacionService.notificarRol(Rol.ADMINISTRADOR,
                    TipoNotificacion.SISTEMA, "Reembolso pendiente",
                    "No se pudo reembolsar automáticamente el pedido cancelado con id " + pedidoId + "."));
        }
    }

    @Override
    public PageResponse<PedidoResumenResponse> buscar(Long sucursalId, EstadoPedido estado, LocalDate desde,
                                                      LocalDate hasta, String texto, Pageable pageable) {
        LocalDate fin = hasta != null ? hasta : FechaUtil.hoy(clock);
        LocalDate inicio = desde != null ? desde : fin.minusDays(DIAS_BUSQUEDA_POR_DEFECTO);
        String patron = "%" + (texto == null ? "" : texto.trim().toLowerCase(Locale.ROOT)) + "%";
        return PageResponse.of(pedidoRepository
                .buscarAdmin(sucursalId, estado, FechaUtil.inicioDelDia(inicio, clock), FechaUtil.finDelDia(fin, clock),
                        patron, pageable)
                .map(pedidoMapper::toResumen));
    }

    @Override
    public PedidoResponse detalleAdmin(Long pedidoId) {
        return pedidoAssembler.respuesta(pedidoRepository.findConDetalleById(pedidoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido", pedidoId)));
    }
}
