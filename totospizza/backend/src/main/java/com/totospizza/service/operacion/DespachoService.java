package com.totospizza.service.operacion;

import java.util.List;

import com.totospizza.dto.request.operacion.AsignarMotorizadoRequest;
import com.totospizza.dto.response.operacion.EntregaResponse;
import com.totospizza.dto.response.operacion.PedidoListoResponse;
import com.totospizza.dto.response.seguridad.EmpleadoResponse;

public interface DespachoService {

    List<PedidoListoResponse> pedidosListos(Long usuarioId);

    List<EmpleadoResponse> motorizadosDisponibles(Long usuarioId);

    EntregaResponse asignarMotorizado(Long usuarioId, Long pedidoId, AsignarMotorizadoRequest request);

    PedidoListoResponse entregarEnMostrador(Long usuarioId, Long pedidoId);
}
