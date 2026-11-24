package com.totospizza.service.operacion;

import java.util.List;

import com.totospizza.dto.request.operacion.AsignarMotorizadoRequest;
import com.totospizza.dto.response.operacion.EntregaResponse;
import com.totospizza.dto.response.operacion.PedidoListoResponse;
import com.totospizza.dto.response.operacion.ResumenDespachoResponse;
import com.totospizza.dto.response.seguridad.EmpleadoResponse;
import com.totospizza.dto.request.operacion.MotivoRequest;
import com.totospizza.dto.request.pedido.CancelarPedidoRequest;

public interface DespachoService {

    List<PedidoListoResponse> pedidosListos(Long usuarioId);

    ResumenDespachoResponse resumen(Long usuarioId);

    List<EmpleadoResponse> motorizadosDisponibles(Long usuarioId);

    EntregaResponse asignarMotorizado(Long usuarioId, Long pedidoId, AsignarMotorizadoRequest request);

    PedidoListoResponse entregarEnMostrador(Long usuarioId, Long pedidoId);

    /** Pone en cero los intentos de PIN de una entrega bloqueada para que el motorizado lo vuelva a ingresar. */
    PedidoListoResponse desbloquearPin(Long usuarioId, Long pedidoId);

    /** Cierra como entregada una entrega con el PIN bloqueado, después de confirmar con el cliente. */
    PedidoListoResponse confirmarSinPin(Long usuarioId, Long pedidoId, MotivoRequest request);

    /** Cancela y reembolsa un delivery que no se pudo entregar. */
    PedidoListoResponse cancelarEntregaFallida(Long usuarioId, Long pedidoId, CancelarPedidoRequest request);
}
