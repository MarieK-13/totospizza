package com.totospizza.service.impl.pago;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import com.totospizza.dto.request.pago.PagoRequest;
import com.totospizza.dto.request.pago.ReembolsoRequest;
import com.totospizza.dto.response.pago.MetodoPagoDisponibleResponse;
import com.totospizza.dto.response.pago.PagoResponse;
import com.totospizza.exception.ConflictoException;
import com.totospizza.exception.RecursoNoEncontradoException;
import com.totospizza.exception.ReglaNegocioException;
import com.totospizza.integration.pagos.PasarelaPago;
import com.totospizza.integration.pagos.ResultadoCobro;
import com.totospizza.integration.pagos.ResultadoConsulta;
import com.totospizza.integration.pagos.ResultadoReembolso;
import com.totospizza.integration.pagos.SolicitudCobro;
import com.totospizza.mapper.pago.PagoMapper;
import com.totospizza.model.entity.finanzas.MovimientoFinanciero;
import com.totospizza.model.entity.pago.Pago;
import com.totospizza.model.entity.pedido.Pedido;
import com.totospizza.model.enums.EstadoPago;
import com.totospizza.model.enums.EstadoPedido;
import com.totospizza.model.enums.MetodoPago;
import com.totospizza.model.enums.Rol;
import com.totospizza.model.enums.TipoNotificacion;
import com.totospizza.model.enums.TipoMovimientoFinanciero;
import com.totospizza.repository.configuracion.MetodoPagoHabilitadoRepository;
import com.totospizza.repository.finanzas.MovimientoFinancieroRepository;
import com.totospizza.repository.pago.PagoRepository;
import com.totospizza.repository.pedido.PedidoRepository;
import com.totospizza.service.operacion.NotificacionService;
import com.totospizza.service.pago.PagoService;
import com.totospizza.service.pedido.PedidoEstadoService;

@Slf4j
@Service
@RequiredArgsConstructor
public class PagoServiceImpl implements PagoService {

    private static final Set<MetodoPago> CON_TOKEN = EnumSet.of(MetodoPago.TARJETA, MetodoPago.CMR);
    private static final Set<MetodoPago> CON_TELEFONO = EnumSet.of(MetodoPago.YAPE, MetodoPago.PLIN);

    /** Tiempo que se le da a un cobro para responder antes de que la conciliación lo investigue. */
    private static final Duration ESPERA_CONCILIACION = Duration.ofMinutes(2);

    private final PedidoRepository pedidoRepository;
    private final PagoRepository pagoRepository;
    private final MetodoPagoHabilitadoRepository metodoRepository;
    private final MovimientoFinancieroRepository movimientoRepository;
    private final PedidoEstadoService pedidoEstadoService;
    private final NotificacionService notificacionService;
    private final PasarelaPago pasarela;
    private final PagoMapper pagoMapper;
    private final TransactionTemplate transaccion;
    private final Clock clock;

    /** Lo que sale de la primera transacción y entra a la pasarela. */
    private record Intento(Long pagoId, SolicitudCobro solicitud) {
    }

    /** Pago pendiente a conciliar: lo mínimo que hace falta para consultar a la pasarela. */
    private record PendienteConciliar(Long pagoId, Long pedidoId, String referenciaIntento) {
    }

    /** Resultado de registrar un cobro; {@code reembolsar} indica que se cobró un pedido ya cancelado. */
    private record Registro(PagoResponse pago, boolean reembolsar) {
    }

    /** Lo que sale de la primera transacción de un reembolso y entra a la pasarela. */
    private record IntentoReembolso(Long pagoId, String referencia, BigDecimal monto) {
    }

    @Override
    @Transactional(readOnly = true)
    public List<MetodoPagoDisponibleResponse> metodosDisponibles() {
        return metodoRepository.findByActivoTrueOrderByOrdenAsc().stream()
                .map(m -> new MetodoPagoDisponibleResponse(m.getMetodo(), m.getMetodo().getEtiqueta(), m.getOrden()))
                .toList();
    }

    @Override
    public void validarMetodo(PagoRequest request) {
        MetodoPago metodo = request.metodo();
        if (CON_TOKEN.contains(metodo) && esVacio(request.tokenTarjeta())) {
            throw new ReglaNegocioException("DATOS_PAGO_INCOMPLETOS", "Falta el token de la tarjeta");
        }
        if (CON_TELEFONO.contains(metodo) && esVacio(request.telefonoBilletera())) {
            throw new ReglaNegocioException("DATOS_PAGO_INCOMPLETOS", "Falta el celular de la billetera");
        }
    }

    @Override
    public PagoResponse cobrar(Long usuarioId, Long pedidoId, PagoRequest request) {
        validarMetodo(request);
        Intento intento = transaccion.execute(estado -> iniciarCobro(usuarioId, pedidoId, request));
        ResultadoCobro resultado = cobrarEnPasarela(intento.solicitud());
        Registro registro = transaccion.execute(estado ->
                registrarResultado(pedidoId, intento.pagoId(), resultado, false));
        if (registro.reembolsar()) {
            reembolsarOAvisar(pedidoId);
        }
        if (!resultado.aprobado()) {
            throw new ReglaNegocioException("PAGO_RECHAZADO", mensajeRechazo(resultado));
        }
        return registro.pago();
    }

    @Override
    public int conciliarPendientes() {
        Instant limite = Instant.now(clock).minus(ESPERA_CONCILIACION);
        List<PendienteConciliar> pendientes = transaccion.execute(estado ->
                pagoRepository.findByEstadoAndCreadoEnBefore(EstadoPago.PENDIENTE, limite).stream()
                        .map(p -> new PendienteConciliar(p.getId(), p.getPedido().getId(), p.getReferenciaIntento()))
                        .toList());
        int resueltos = 0;
        for (PendienteConciliar pendiente : pendientes) {
            if (conciliar(pendiente)) {
                resueltos++;
            }
        }
        return resueltos;
    }

    @Override
    public PagoResponse reembolsar(Long pedidoId, ReembolsoRequest request) {
        return reembolsarMonto(pedidoId, request.monto(), request.motivo());
    }

    @Override
    public void reembolsarCancelacion(Long pedidoId, String motivo) {
        pagoAprobado(pedidoId)
                .map(pago -> pago.getMonto().subtract(reembolsado(pago)))
                .filter(restante -> restante.signum() > 0)
                .ifPresent(restante -> reembolsarMonto(pedidoId, restante, motivo));
    }

    // ---- cobro ----

    private Intento iniciarCobro(Long usuarioId, Long pedidoId, PagoRequest request) {
        Pedido pedido = pedidoRepository.findByIdForUpdate(pedidoId)
                .filter(p -> p.getCliente().getId().equals(usuarioId))
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido", pedidoId));
        if (pedido.getEstado() != EstadoPedido.PENDIENTE_PAGO) {
            throw new ReglaNegocioException("PEDIDO_NO_PAGABLE", "Este pedido ya no admite pago");
        }
        boolean habilitado = metodoRepository.findByMetodo(request.metodo()).filter(m -> m.isActivo()).isPresent();
        if (!habilitado) {
            throw new ReglaNegocioException("METODO_NO_DISPONIBLE", "Ese método de pago no está disponible");
        }
        // Mientras haya un cobro sin resolver no se admite otro: si el primero llegó a cobrarse, sería un doble cobro.
        boolean cobroEnCurso = pagoRepository.findByPedidoIdOrderByCreadoEnDesc(pedidoId).stream()
                .anyMatch(p -> p.getEstado() == EstadoPago.PENDIENTE);
        if (cobroEnCurso) {
            throw new ConflictoException("PAGO_EN_CURSO", "Ya hay un pago en proceso para este pedido");
        }

        Pago pago = new Pago();
        pago.setPedido(pedido);
        pago.setMetodo(request.metodo());
        pago.setEstado(EstadoPago.PENDIENTE);
        pago.setMonto(pedido.getTotal());
        pago.setReferenciaIntento(nuevaReferencia(pedido));
        pagoRepository.saveAndFlush(pago);

        return new Intento(pago.getId(), new SolicitudCobro(pago.getReferenciaIntento(), request.metodo(),
                request.tokenTarjeta(), request.telefonoBilletera(), pedido.getTotal()));
    }

    /** Única por intento (no por pedido): un reintento tras un rechazo es otro cobro y no debe confundirse con el anterior. */
    private static String nuevaReferencia(Pedido pedido) {
        return pedido.getNumero() + "-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
    }

    /**
     * Una excepción de la pasarela significa que no se sabe si cobró (tiempo de espera, red caída). No se
     * marca como rechazado: el pago queda PENDIENTE y {@link #conciliarPendientes()} lo resuelve consultando.
     */
    private ResultadoCobro cobrarEnPasarela(SolicitudCobro solicitud) {
        try {
            return pasarela.cobrar(solicitud);
        } catch (RuntimeException e) {
            log.error("Resultado incierto al cobrar la referencia {}", solicitud.referencia(), e);
            throw new ReglaNegocioException("PAGO_PENDIENTE_CONFIRMACION",
                    "Estamos confirmando tu pago con el medio de pago. Revisa el estado de tu pedido en unos minutos"
                            + " y no vuelvas a pagar.");
        }
    }

    /**
     * Guarda el resultado del cobro y avanza el pedido. Es idempotente: si el pago ya se resolvió (por
     * la conciliación, por ejemplo) no vuelve a registrar nada. Con {@code cancelarSiRechazado} un
     * rechazo también cancela el pedido y devuelve las masas, para los casos en que nadie espera la respuesta.
     */
    private Registro registrarResultado(Long pedidoId, Long pagoId, ResultadoCobro resultado, boolean cancelarSiRechazado) {
        Pedido pedido = pedidoRepository.findByIdForUpdate(pedidoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido", pedidoId));
        Pago pago = pagoRepository.findById(pagoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pago", pagoId));
        if (pago.getEstado() != EstadoPago.PENDIENTE) {
            return new Registro(pagoMapper.toResponse(pago), false);
        }

        if (resultado.aprobado()) {
            pago.setEstado(EstadoPago.APROBADO);
            pago.setReferenciaExterna(resultado.referenciaExterna());
            pago.setMarcaTarjeta(resultado.marcaTarjeta());
            pago.setUltimosDigitos(resultado.ultimosDigitos());
            pago.setPagadoEn(Instant.now(clock));
            registrarMovimiento(pedido, pago, TipoMovimientoFinanciero.INGRESO, "Venta online " + pedido.getNumero(),
                    pago.getMonto());
            boolean pedidoVigente = pedido.getEstado() == EstadoPedido.PENDIENTE_PAGO;
            if (pedidoVigente) {
                pedidoEstadoService.confirmarPago(pedidoId);
            }
            return new Registro(pagoMapper.toResponse(pago), !pedidoVigente);
        }

        pago.setEstado(EstadoPago.RECHAZADO);
        PagoResponse respuesta = pagoMapper.toResponse(pago); // antes de cancelar: la reposición de stock limpia el contexto
        if (cancelarSiRechazado && pedido.getEstado() == EstadoPedido.PENDIENTE_PAGO) {
            pedidoEstadoService.cancelar(pedidoId, null, "Pago no completado");
        }
        return new Registro(respuesta, false);
    }

    private static String mensajeRechazo(ResultadoCobro resultado) {
        return resultado.motivoRechazo() == null || resultado.motivoRechazo().isBlank()
                ? "El pago fue rechazado"
                : resultado.motivoRechazo();
    }

    // ---- conciliación ----

    /** Devuelve true si el pago quedó resuelto. Un fallo con un pago no detiene a los demás. */
    private boolean conciliar(PendienteConciliar pendiente) {
        ResultadoConsulta consulta;
        try {
            consulta = pasarela.consultar(pendiente.referenciaIntento());
        } catch (RuntimeException e) {
            log.warn("No se pudo consultar el cobro {}; se reintenta en la próxima conciliación",
                    pendiente.referenciaIntento(), e);
            return false;
        }
        if (consulta.estado() == ResultadoConsulta.Estado.PENDIENTE) {
            log.warn("El cobro {} sigue pendiente en la pasarela", pendiente.referenciaIntento());
            return false;
        }
        ResultadoCobro resultado = consulta.estado() == ResultadoConsulta.Estado.APROBADO
                ? new ResultadoCobro(true, consulta.referenciaExterna(), consulta.marcaTarjeta(),
                        consulta.ultimosDigitos(), null)
                : new ResultadoCobro(false, null, null, null,
                        consulta.motivoRechazo() == null ? "No se completó el cobro" : consulta.motivoRechazo());
        try {
            Registro registro = transaccion.execute(estado ->
                    registrarResultado(pendiente.pedidoId(), pendiente.pagoId(), resultado, true));
            if (registro.reembolsar()) {
                reembolsarOAvisar(pendiente.pedidoId());
            }
            log.info("Cobro {} conciliado como {}", pendiente.referenciaIntento(), consulta.estado());
            return true;
        } catch (RuntimeException e) {
            log.error("No se pudo registrar la conciliación del cobro {}", pendiente.referenciaIntento(), e);
            return false;
        }
    }

    /** Se cobró un pedido que ya estaba cancelado: se devuelve el dinero; si falla se avisa a los administradores. */
    private void reembolsarOAvisar(Long pedidoId) {
        try {
            reembolsarCancelacion(pedidoId, "Pago recibido con el pedido ya cancelado");
        } catch (RuntimeException e) {
            log.error("Reembolso pendiente del pedido {}", pedidoId, e);
            transaccion.executeWithoutResult(estado -> notificacionService.notificarRol(Rol.ADMINISTRADOR,
                    TipoNotificacion.SISTEMA, "Reembolso pendiente",
                    "Se cobró un pedido ya cancelado y no se pudo reembolsar automáticamente (pedido id "
                            + pedidoId + ")."));
        }
    }

    // ---- reembolso ----

    private PagoResponse reembolsarMonto(Long pedidoId, BigDecimal monto, String motivo) {
        IntentoReembolso intento = transaccion.execute(estado -> iniciarReembolso(pedidoId, monto));
        ResultadoReembolso resultado = reembolsarEnPasarela(intento);
        if (!resultado.exitoso()) {
            throw new ReglaNegocioException("REEMBOLSO_FALLIDO",
                    resultado.motivoFallo() == null ? "La pasarela no pudo procesar el reembolso" : resultado.motivoFallo());
        }
        return transaccion.execute(estado -> registrarReembolso(intento, motivo));
    }

    private IntentoReembolso iniciarReembolso(Long pedidoId, BigDecimal monto) {
        Pago pago = pagoAprobado(pedidoId)
                .orElseThrow(() -> new ReglaNegocioException("SIN_PAGO", "El pedido no tiene un pago aprobado"));
        BigDecimal disponible = pago.getMonto().subtract(reembolsado(pago));
        if (monto.signum() <= 0 || monto.compareTo(disponible) > 0) {
            throw new ReglaNegocioException("MONTO_INVALIDO",
                    "El reembolso debe ser mayor a cero y no superar S/ " + disponible);
        }
        return new IntentoReembolso(pago.getId(), pago.getReferenciaExterna(), monto);
    }

    private ResultadoReembolso reembolsarEnPasarela(IntentoReembolso intento) {
        try {
            return pasarela.reembolsar(intento.referencia(), intento.monto());
        } catch (RuntimeException e) {
            log.error("Fallo al reembolsar la referencia {}", intento.referencia(), e);
            return new ResultadoReembolso(false, "No pudimos comunicarnos con el medio de pago");
        }
    }

    private PagoResponse registrarReembolso(IntentoReembolso intento, String motivo) {
        Pago pago = pagoRepository.findById(intento.pagoId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Pago", intento.pagoId()));
        BigDecimal total = reembolsado(pago).add(intento.monto());
        pago.setMontoReembolsado(total);
        pago.setReembolsadoEn(Instant.now(clock));
        pago.setMotivoReembolso(motivo);
        if (total.compareTo(pago.getMonto()) >= 0) {
            pago.setEstado(EstadoPago.REEMBOLSADO);
        }
        registrarMovimiento(pago.getPedido(), pago, TipoMovimientoFinanciero.EGRESO,
                "Reembolso pedido " + pago.getPedido().getNumero(), intento.monto());
        return pagoMapper.toResponse(pago);
    }

    // ---- apoyo ----

    private Optional<Pago> pagoAprobado(Long pedidoId) {
        return pagoRepository.findFirstByPedidoIdAndEstadoOrderByPagadoEnDesc(pedidoId, EstadoPago.APROBADO);
    }

    private static BigDecimal reembolsado(Pago pago) {
        return pago.getMontoReembolsado() == null ? BigDecimal.ZERO : pago.getMontoReembolsado();
    }

    private void registrarMovimiento(Pedido pedido, Pago pago, TipoMovimientoFinanciero tipo, String concepto, BigDecimal monto) {
        MovimientoFinanciero movimiento = new MovimientoFinanciero();
        movimiento.setSucursal(pedido.getSucursal());
        movimiento.setTipo(tipo);
        movimiento.setConcepto(concepto);
        movimiento.setMonto(monto);
        movimiento.setPedido(pedido);
        movimiento.setPago(pago);
        movimiento.setOcurridoEn(Instant.now(clock));
        movimientoRepository.save(movimiento);
    }

    private static boolean esVacio(String texto) {
        return texto == null || texto.isBlank();
    }
}
