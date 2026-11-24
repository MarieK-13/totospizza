package com.totospizza.dto.response.operacion;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import com.totospizza.dto.response.seguridad.DireccionResponse;

import com.totospizza.model.enums.EstadoEntrega;
import com.totospizza.model.enums.EstadoPedido;
import com.totospizza.model.enums.TipoEntrega;

/**
 * Pedido listo en el mostrador del despachador. {@code estado} distingue los que esperan (LISTO)
 * de los que ya salieron con el motorizado (EN_CAMINO); {@code distanciaKm} y {@code asignadaEn}
 * vienen de la entrega (solo delivery).
 */
public record PedidoListoResponse(
        Long pedidoId,
        String numero,
        TipoEntrega tipoEntrega,
        String nombreCliente,
        String telefonoCliente,
        DireccionResponse direccion,
        String instrucciones,
        Integer cantidadItems,
        List<ItemCocinaResponse> items,
        Instant listoEn,
        EstadoEntrega estadoEntrega,
        String motorizadoNombre,
        Instant vencimientoRecojo,
        EstadoPedido estado,
        BigDecimal distanciaKm,
        Instant asignadaEn,
        Integer intentosRestantesPin,
        String motivoFallo,
        Instant fallidaEn
) {
}
