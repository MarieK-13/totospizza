package com.totospizza.service.operacion;

import java.util.List;

import com.totospizza.dto.request.operacion.ConfirmarEntregaRequest;
import com.totospizza.dto.response.operacion.EntregaAsignadaResponse;
import com.totospizza.dto.response.operacion.EntregaResponse;
import com.totospizza.dto.response.operacion.ResumenRepartoResponse;
import com.totospizza.dto.request.operacion.MotivoRequest;

public interface RepartoService {

    List<EntregaAsignadaResponse> misEntregas(Long usuarioId);

    ResumenRepartoResponse resumen(Long usuarioId);

    EntregaResponse iniciarRuta(Long usuarioId, Long entregaId);

    /** El motorizado no pudo entregar: la entrega queda FALLIDA y el pedido vuelve al mostrador. */
    EntregaResponse reportarFallida(Long usuarioId, Long entregaId, MotivoRequest request);

    EntregaResponse confirmarEntrega(Long usuarioId, Long entregaId, ConfirmarEntregaRequest request);
}
