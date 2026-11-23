package com.totospizza.service.impl.finanzas;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.common.PageResponse;
import com.totospizza.dto.request.finanzas.MovimientoFinancieroRequest;
import com.totospizza.dto.request.finanzas.RegistrarPagoMotorizadoRequest;
import com.totospizza.dto.response.finanzas.FinanzasResponse;
import com.totospizza.dto.response.finanzas.MovimientoFinancieroResponse;
import com.totospizza.dto.response.finanzas.PagoMotorizadoResponse;
import com.totospizza.dto.response.finanzas.PedidosPorEstadoResponse;
import com.totospizza.dto.response.finanzas.ProductoVendidoResponse;
import com.totospizza.dto.response.finanzas.RankingProductosResponse;
import com.totospizza.dto.response.finanzas.ResumenAdminResponse;
import com.totospizza.exception.ConflictoException;
import com.totospizza.exception.RecursoNoEncontradoException;
import com.totospizza.exception.ReglaNegocioException;
import com.totospizza.mapper.finanzas.FinanzasMapper;
import com.totospizza.model.entity.finanzas.MovimientoFinanciero;
import com.totospizza.model.entity.finanzas.PagoMotorizado;
import com.totospizza.model.entity.seguridad.Empleado;
import com.totospizza.model.enums.EstadoEntrega;
import com.totospizza.model.enums.EstadoPago;
import com.totospizza.model.enums.EstadoPagoPersonal;
import com.totospizza.model.enums.EstadoTurno;
import com.totospizza.model.enums.Rol;
import com.totospizza.model.enums.TipoMovimientoFinanciero;
import com.totospizza.repository.catalogo.ProductoRepository;
import com.totospizza.repository.finanzas.MovimientoFinancieroRepository;
import com.totospizza.repository.finanzas.PagoMotorizadoRepository;
import com.totospizza.repository.operacion.EntregaRepository;
import com.totospizza.repository.operacion.TurnoRepository;
import com.totospizza.repository.pago.PagoRepository;
import com.totospizza.repository.pedido.DetallePedidoRepository;
import com.totospizza.repository.pedido.PedidoRepository;
import com.totospizza.repository.seguridad.EmpleadoRepository;
import com.totospizza.repository.seguridad.UsuarioRepository;
import com.totospizza.repository.sucursal.SucursalRepository;
import com.totospizza.rules.calculator.CalculadoraPagoMotorizado;
import com.totospizza.rules.calculator.CalculadoraRanking;
import com.totospizza.rules.calculator.CalculadoraPagoMotorizado.Liquidacion;
import com.totospizza.rules.policy.PedidoEstadoPolicy;
import com.totospizza.service.finanzas.FinanzasService;
import com.totospizza.service.operacion.InventarioService;
import com.totospizza.util.FechaUtil;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FinanzasServiceImpl implements FinanzasService {

    private static final int TAMANO_RANKING = 5;
    private static final int DIAS_POR_DEFECTO = 30;
    private static final int MAX_DIAS_REPORTE = 366;
    private static final int MAX_PENDIENTES_EN_REPORTE = 50;

    private final MovimientoFinancieroRepository movimientoRepository;
    private final PagoMotorizadoRepository pagoMotorizadoRepository;
    private final PedidoRepository pedidoRepository;
    private final DetallePedidoRepository detallePedidoRepository;
    private final PagoRepository pagoRepository;
    private final ProductoRepository productoRepository;
    private final EmpleadoRepository empleadoRepository;
    private final TurnoRepository turnoRepository;
    private final EntregaRepository entregaRepository;
    private final SucursalRepository sucursalRepository;
    private final UsuarioRepository usuarioRepository;
    private final InventarioService inventarioService;
    private final FinanzasMapper finanzasMapper;
    private final Clock clock;

    @Override
    public ResumenAdminResponse resumen(Long sucursalId) {
        LocalDate hoy = FechaUtil.hoy(clock);
        Instant fin = FechaUtil.finDelDia(hoy, clock);
        Instant inicioHoy = FechaUtil.inicioDelDia(hoy, clock);

        BigDecimal ventasHoy = cero(pedidoRepository.sumarVentas(
                PedidoEstadoPolicy.ESTADOS_VENTA, inicioHoy, fin, sucursalId));
        List<PedidosPorEstadoResponse> porEstado = finanzasMapper.toPedidosPorEstado(
                pedidoRepository.contarPorEstado(inicioHoy, fin, sucursalId));
        long pedidosHoy = porEstado.stream()
                .filter(p -> PedidoEstadoPolicy.ESTADOS_VENTA.contains(p.estado()))
                .mapToLong(PedidosPorEstadoResponse::cantidad)
                .sum();

        return new ResumenAdminResponse(
                ganancia(sucursalId, FechaUtil.inicioDelDia(hoy.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)), clock), fin),
                ganancia(sucursalId, FechaUtil.inicioDelDia(hoy.withDayOfMonth(1), clock), fin),
                ganancia(sucursalId, FechaUtil.inicioDelDia(hoy.withDayOfYear(1), clock), fin),
                ventasHoy, pedidosHoy, deudaMotorizados(),
                inventarioService.contarStockBajo(sucursalId), porEstado);
    }

    @Override
    public FinanzasResponse reporte(Long sucursalId, LocalDate desde, LocalDate hasta) {
        validarRango(desde, hasta);
        Instant inicio = FechaUtil.inicioDelDia(desde, clock);
        Instant fin = FechaUtil.finDelDia(hasta, clock);

        BigDecimal ingresos = total(TipoMovimientoFinanciero.INGRESO, sucursalId, inicio, fin);
        BigDecimal egresos = total(TipoMovimientoFinanciero.EGRESO, sucursalId, inicio, fin);
        Set<String> estadosVenta = PedidoEstadoPolicy.ESTADOS_VENTA.stream().map(Enum::name).collect(Collectors.toSet());

        return new FinanzasResponse(desde, hasta, ingresos, egresos, ingresos.subtract(egresos), deudaMotorizados(),
                finanzasMapper.toVentasDiarias(pedidoRepository.ventasPorDia(inicio, fin, estadosVenta, sucursalId)),
                finanzasMapper.toVentasPorMetodo(pagoRepository.resumenPorMetodo(EstadoPago.APROBADO, inicio, fin, sucursalId)),
                ranking(sucursalId, inicio, fin),
                finanzasMapper.toPagosMotorizados(pagoMotorizadoRepository
                        .findByEstadoOrderByPeriodoHastaDesc(EstadoPagoPersonal.PENDIENTE,
                                PageRequest.of(0, MAX_PENDIENTES_EN_REPORTE))
                        .getContent()));
    }

    @Override
    public PageResponse<MovimientoFinancieroResponse> movimientos(Long sucursalId, LocalDate desde, LocalDate hasta,
                                                                  Pageable pageable) {
        LocalDate fin = hasta != null ? hasta : FechaUtil.hoy(clock);
        LocalDate inicio = desde != null ? desde : fin.minusDays(DIAS_POR_DEFECTO);
        validarRango(inicio, fin);
        return PageResponse.of(movimientoRepository
                .findRecientes(sucursalId, FechaUtil.inicioDelDia(inicio, clock), FechaUtil.finDelDia(fin, clock), pageable)
                .map(finanzasMapper::toMovimiento));
    }

    @Override
    @Transactional
    public MovimientoFinancieroResponse registrarMovimiento(Long usuarioId, MovimientoFinancieroRequest request) {
        MovimientoFinanciero movimiento = finanzasMapper.toEntity(request);
        movimiento.setSucursal(request.sucursalId() == null ? null : sucursalRepository.findById(request.sucursalId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Sucursal", request.sucursalId())));
        movimiento.setRegistradoPor(usuarioRepository.getReferenceById(usuarioId));
        if (movimiento.getOcurridoEn() == null) {
            movimiento.setOcurridoEn(Instant.now(clock));
        }
        return finanzasMapper.toMovimiento(movimientoRepository.save(movimiento));
    }

    @Override
    @Transactional
    public PagoMotorizadoResponse liquidarMotorizado(RegistrarPagoMotorizadoRequest request) {
        validarRango(request.periodoDesde(), request.periodoHasta());
        Empleado motorizado = empleadoRepository.findById(request.empleadoId())
                .filter(e -> e.getUsuario().getRol() == Rol.MOTORIZADO)
                .orElseThrow(() -> new RecursoNoEncontradoException("Motorizado", request.empleadoId()));
        if (pagoMotorizadoRepository.existsByEmpleadoIdAndPeriodoDesdeAndPeriodoHasta(
                motorizado.getId(), request.periodoDesde(), request.periodoHasta())) {
            throw new ConflictoException("PERIODO_LIQUIDADO", "Ese periodo ya fue liquidado para este motorizado");
        }

        long turnos = turnoRepository.countByEmpleadoIdAndEstadoAndFechaBetween(
                motorizado.getId(), EstadoTurno.FINALIZADO, request.periodoDesde(), request.periodoHasta());
        long entregas = entregaRepository.countByMotorizadoIdAndEstadoAndEntregadaEnBetween(
                motorizado.getId(), EstadoEntrega.ENTREGADA,
                FechaUtil.inicioDelDia(request.periodoDesde(), clock), FechaUtil.finDelDia(request.periodoHasta(), clock));
        Liquidacion liquidacion = CalculadoraPagoMotorizado.calcular(
                motorizado.getPagoBaseTurno(), motorizado.getBonoPorEntrega(), turnos, entregas);

        PagoMotorizado pago = new PagoMotorizado();
        pago.setEmpleado(motorizado);
        pago.setPeriodoDesde(request.periodoDesde());
        pago.setPeriodoHasta(request.periodoHasta());
        pago.setTotalEntregas((int) entregas);
        pago.setMontoBase(liquidacion.montoBase());
        pago.setMontoBonos(liquidacion.montoBonos());
        pago.setMontoTotal(liquidacion.montoTotal());
        pago.setEstado(EstadoPagoPersonal.PENDIENTE);
        return finanzasMapper.toPagoMotorizado(pagoMotorizadoRepository.save(pago));
    }

    @Override
    public PageResponse<PagoMotorizadoResponse> pagosPendientes(Pageable pageable) {
        return PageResponse.of(pagoMotorizadoRepository
                .findByEstadoOrderByPeriodoHastaDesc(EstadoPagoPersonal.PENDIENTE, pageable)
                .map(finanzasMapper::toPagoMotorizado));
    }

    @Override
    @Transactional
    public PagoMotorizadoResponse marcarPagado(Long usuarioId, Long pagoId) {
        PagoMotorizado pago = pagoMotorizadoRepository.findById(pagoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pago a motorizado", pagoId));
        if (pago.getEstado() == EstadoPagoPersonal.PAGADO) {
            throw new ConflictoException("PAGO_YA_REGISTRADO", "Este pago ya fue registrado");
        }
        Instant ahora = Instant.now(clock);
        pago.setEstado(EstadoPagoPersonal.PAGADO);
        pago.setPagadoEn(ahora);

        MovimientoFinanciero egreso = new MovimientoFinanciero();
        egreso.setSucursal(pago.getEmpleado().getSucursal());
        egreso.setTipo(TipoMovimientoFinanciero.EGRESO);
        egreso.setConcepto("Pago a motorizado " + pago.getEmpleado().getUsuario().getNombres() + " ("
                + pago.getPeriodoDesde() + " a " + pago.getPeriodoHasta() + ")");
        egreso.setMonto(pago.getMontoTotal());
        egreso.setRegistradoPor(usuarioRepository.getReferenceById(usuarioId));
        egreso.setOcurridoEn(ahora);
        movimientoRepository.save(egreso);
        return finanzasMapper.toPagoMotorizado(pago);
    }

    // ---- apoyo ----

    private RankingProductosResponse ranking(Long sucursalId, Instant inicio, Instant fin) {
        List<ProductoVendidoResponse> todos = finanzasMapper.toProductosVendidos(detallePedidoRepository.masVendidos(
                PedidoEstadoPolicy.ESTADOS_VENTA, inicio, fin, sucursalId, Pageable.unpaged()));
        List<ProductoVendidoResponse> masVendidos = todos.stream().limit(TAMANO_RANKING).toList();
        List<ProductoVendidoResponse> menosVendidos = CalculadoraRanking.menosVendidos(
                todos, productoRepository.findNombresDisponibles(), TAMANO_RANKING);
        return new RankingProductosResponse(masVendidos, menosVendidos);
    }

    private BigDecimal ganancia(Long sucursalId, Instant inicio, Instant fin) {
        return total(TipoMovimientoFinanciero.INGRESO, sucursalId, inicio, fin)
                .subtract(total(TipoMovimientoFinanciero.EGRESO, sucursalId, inicio, fin));
    }

    private BigDecimal total(TipoMovimientoFinanciero tipo, Long sucursalId, Instant inicio, Instant fin) {
        return cero(movimientoRepository.sumarPorTipo(tipo, inicio, fin, sucursalId));
    }

    private BigDecimal deudaMotorizados() {
        return cero(pagoMotorizadoRepository.totalPorEstado(EstadoPagoPersonal.PENDIENTE));
    }

    private static BigDecimal cero(BigDecimal valor) {
        return valor == null ? BigDecimal.ZERO : valor;
    }

    private static void validarRango(LocalDate desde, LocalDate hasta) {
        if (desde.isAfter(hasta)) {
            throw new ReglaNegocioException("RANGO_INVALIDO", "La fecha inicial no puede ser posterior a la final");
        }
        if (ChronoUnit.DAYS.between(desde, hasta) > MAX_DIAS_REPORTE) {
            throw new ReglaNegocioException("RANGO_MUY_AMPLIO", "El periodo no puede superar un año");
        }
    }
}
