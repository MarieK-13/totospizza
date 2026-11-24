package com.totospizza.service.pedido;

import java.time.LocalDate;

import org.springframework.data.domain.Pageable;

import com.totospizza.dto.common.PageResponse;
import com.totospizza.dto.request.pedido.CancelarPedidoRequest;
import com.totospizza.dto.request.pedido.CheckoutRequest;
import com.totospizza.dto.response.pedido.CheckoutResponse;
import com.totospizza.dto.response.pedido.PedidoResponse;
import com.totospizza.dto.response.pedido.PedidoResumenResponse;
import com.totospizza.dto.response.pedido.SeguimientoResponse;
import com.totospizza.model.enums.EstadoPedido;

public interface PedidoService {

    CheckoutResponse checkout(Long usuarioId, CheckoutRequest request);

    PageResponse<PedidoResumenResponse> misPedidos(Long usuarioId, Pageable pageable);

    PedidoResponse detalle(Long usuarioId, String numero);

    SeguimientoResponse seguimiento(Long usuarioId, String numero);

    PedidoResponse cancelar(Long usuarioId, String numero, CancelarPedidoRequest request);

    PageResponse<PedidoResumenResponse> buscar(Long sucursalId, EstadoPedido estado, LocalDate desde, LocalDate hasta,
                                               String texto, Pageable pageable);

    PedidoResponse detalleAdmin(Long pedidoId);

    PedidoResponse cancelarAdmin(Long adminId, Long pedidoId, CancelarPedidoRequest request);
}
