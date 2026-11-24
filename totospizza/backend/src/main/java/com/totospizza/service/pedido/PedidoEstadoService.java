package com.totospizza.service.pedido;

import com.totospizza.dto.request.operacion.CambiarEstadoPedidoRequest;
import com.totospizza.dto.response.pedido.PedidoResponse;
import com.totospizza.model.entity.pedido.Pedido;
import com.totospizza.model.enums.EstadoPedido;


public interface PedidoEstadoService {

    void registrarCreacion(Pedido pedido);

    Pedido confirmarPago(Long pedidoId);

    Pedido avanzar(Long pedidoId, EstadoPedido nuevo, Long usuarioId, String comentario);

    Pedido cancelar(Long pedidoId, Long usuarioId, String motivo);

    PedidoResponse cambiarEstado(Long pedidoId, Long usuarioId, CambiarEstadoPedidoRequest request);

    int marcarNoRecogidos();

    int expirarPendientesDePago();
}
