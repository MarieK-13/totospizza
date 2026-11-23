package com.totospizza.service.pedido;

import com.totospizza.dto.request.operacion.CambiarEstadoPedidoRequest;
import com.totospizza.dto.response.pedido.PedidoResponse;
import com.totospizza.model.entity.pedido.Pedido;
import com.totospizza.model.enums.EstadoPedido;

/**
 * Única puerta para cambiar el estado de un pedido. Valida la transición con
 * {@link com.totospizza.rules.policy.PedidoEstadoPolicy}, aplica los efectos del cambio
 * (fechas, entrega, avisos, garantía) y deja el historial. Bloquea el pedido mientras cambia,
 * así una cancelación y un avance simultáneos no se pisan.
 * Todos los métodos participan de la transacción de quien los llama.
 */
public interface PedidoEstadoService {

    /** Primera fila del historial de un pedido recién creado. */
    void registrarCreacion(Pedido pedido);

    /** PENDIENTE_PAGO → CONFIRMADO. Avisa a cocina. */
    Pedido confirmarPago(Long pedidoId);

    /** Avance operativo: horno, listo, en camino, entregado, no recogido. */
    Pedido avanzar(Long pedidoId, EstadoPedido nuevo, Long usuarioId, String comentario);

    /**
     * Cancela y devuelve las masas al stock web. No reembolsa: eso lo coordina
     * {@link PedidoService} con el servicio de pagos, fuera de la transacción.
     */
    Pedido cancelar(Long pedidoId, Long usuarioId, String motivo);

    /** Cambio manual del administrador. No permite cancelar ni pasar a EN_CAMINO ni entregar con PIN. */
    PedidoResponse cambiarEstado(Long pedidoId, Long usuarioId, CambiarEstadoPedidoRequest request);

    /** Pedidos para recoger que superaron el plazo. Sin reembolso. Devuelve cuántos marcó. */
    int marcarNoRecogidos();

    /**
     * Cancela los pedidos que siguen en PENDIENTE_PAGO pasado el plazo y sin un cobro en curso, y
     * devuelve sus masas al stock web. Es la red de seguridad si la compensación inmediata del
     * checkout no pudo ejecutarse (caída del servidor, error de base de datos). Devuelve cuántos cancela.
     */
    int expirarPendientesDePago();
}
