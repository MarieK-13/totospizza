package com.totospizza.service.pago;

import java.util.List;

import com.totospizza.dto.request.pago.PagoRequest;
import com.totospizza.dto.request.pago.ReembolsoRequest;
import com.totospizza.dto.response.pago.MetodoPagoDisponibleResponse;
import com.totospizza.dto.response.pago.PagoResponse;

/**
 * Pagos exclusivamente online (sin efectivo, cupones ni puntos). Nunca se guarda el número de
 * tarjeta ni el CVV: el frontend entrega un token de la pasarela y solo se conservan la marca y
 * los últimos dígitos. La llamada a la pasarela se hace fuera de cualquier transacción de base
 * de datos para no retener conexiones mientras se espera a un tercero.
 */
public interface PagoService {

    /** Métodos de pago online activos. */
    List<MetodoPagoDisponibleResponse> metodosDisponibles();

    /** Rechaza datos de pago incompletos (falta el token o el celular), antes de crear nada. */
    void validarMetodo(PagoRequest request);

    /**
     * Cobra un pedido pendiente de pago. Si se aprueba, confirma el pedido y registra el ingreso.
     *
     * @throws com.totospizza.exception.ReglaNegocioException con código PAGO_RECHAZADO si la pasarela lo rechaza,
     *         o PAGO_PENDIENTE_CONFIRMACION si no se supo el resultado: el pago queda pendiente y lo resuelve
     *         {@link #conciliarPendientes()}
     */
    PagoResponse cobrar(Long usuarioId, Long pedidoId, PagoRequest request);

    /** Reembolso total o parcial hecho por el administrador. */
    PagoResponse reembolsar(Long pedidoId, ReembolsoRequest request);

    /** Reembolso total de un pedido cancelado. No hace nada si el pedido no tiene un pago aprobado. */
    void reembolsarCancelacion(Long pedidoId, String motivo);

    /**
     * Resuelve los pagos que siguen PENDIENTE pasado el tiempo de espera, preguntando a la pasarela.
     * Un cobro aprobado confirma el pedido (o se reembolsa si el pedido ya se canceló); uno que la
     * pasarela rechazó o nunca recibió se marca RECHAZADO y cancela el pedido. Lo invoca un job
     * programado. Devuelve cuántos pagos resolvió.
     */
    int conciliarPendientes();
}
