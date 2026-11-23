package com.totospizza.dto.response.pedido;

import java.time.Instant;
import java.util.List;

import com.totospizza.dto.response.pago.PagoResponse;
import com.totospizza.dto.response.seguridad.DireccionResponse;
import com.totospizza.model.enums.EstadoPedido;
import com.totospizza.model.enums.TipoEntrega;

/**
 * Detalle completo de un pedido.
 */
public record PedidoResponse(
        Long id,
        String numero,
        String sucursalNombre,
        TipoEntrega tipoEntrega,
        EstadoPedido estado,
        DireccionResponse direccionEntrega,
        String instrucciones,
        List<DetallePedidoResponse> detalles,
        ResumenMontosResponse montos,
        Integer minutosEstimados,
        Instant creadoEn,
        Instant confirmadoEn,
        Instant entregadoEn,
        Instant vencimientoRecojo,
        boolean garantiaAplicada,
        PagoResponse pago,
        List<HistorialEstadoResponse> historial
) {
}
