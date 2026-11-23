package com.totospizza.service.operacion;

import java.util.List;

import com.totospizza.dto.request.operacion.ConfirmarEntregaRequest;
import com.totospizza.dto.response.operacion.EntregaAsignadaResponse;
import com.totospizza.dto.response.operacion.EntregaResponse;

/** Lo que hace el motorizado: ver sus entregas, salir a ruta y confirmar con el PIN que le da el cliente. */
public interface RepartoService {

    /** Entregas asignadas o en camino del motorizado. */
    List<EntregaAsignadaResponse> misEntregas(Long usuarioId);

    /** Recoge el pedido y sale a reparto: la entrega y el pedido pasan a EN_CAMINO. */
    EntregaResponse iniciarRuta(Long usuarioId, Long entregaId);

    /**
     * Confirma la entrega con el PIN de 4 dígitos. Los intentos fallidos se guardan aunque la
     * operación falle y, al llegar al límite, el PIN se bloquea y debe intervenir el despachador.
     */
    EntregaResponse confirmarEntrega(Long usuarioId, Long entregaId, ConfirmarEntregaRequest request);
}
