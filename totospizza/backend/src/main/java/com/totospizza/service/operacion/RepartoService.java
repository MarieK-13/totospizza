package com.totospizza.service.operacion;

import java.util.List;

import com.totospizza.dto.request.operacion.ConfirmarEntregaRequest;
import com.totospizza.dto.response.operacion.EntregaAsignadaResponse;
import com.totospizza.dto.response.operacion.EntregaResponse;

public interface RepartoService {

    List<EntregaAsignadaResponse> misEntregas(Long usuarioId);

    EntregaResponse iniciarRuta(Long usuarioId, Long entregaId);

    EntregaResponse confirmarEntrega(Long usuarioId, Long entregaId, ConfirmarEntregaRequest request);
}
