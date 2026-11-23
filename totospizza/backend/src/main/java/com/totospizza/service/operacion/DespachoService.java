package com.totospizza.service.operacion;

import java.util.List;

import com.totospizza.dto.request.operacion.AsignarMotorizadoRequest;
import com.totospizza.dto.response.operacion.EntregaResponse;
import com.totospizza.dto.response.operacion.PedidoListoResponse;
import com.totospizza.dto.response.seguridad.EmpleadoResponse;

/** Mostrador del despachador: recibe los pedidos listos y los entrega al motorizado o al cliente. */
public interface DespachoService {

    /** Pedidos listos o ya en camino de la sucursal del despachador. */
    List<PedidoListoResponse> pedidosListos(Long usuarioId);

    /** Motorizados de la sucursal que pueden recibir una entrega. */
    List<EmpleadoResponse> motorizadosDisponibles(Long usuarioId);

    /** Asigna (o reasigna, mientras no haya salido) el motorizado de un delivery. */
    EntregaResponse asignarMotorizado(Long usuarioId, Long pedidoId, AsignarMotorizadoRequest request);

    /** Entrega en mostrador de un pedido para recoger. */
    PedidoListoResponse entregarEnMostrador(Long usuarioId, Long pedidoId);
}
