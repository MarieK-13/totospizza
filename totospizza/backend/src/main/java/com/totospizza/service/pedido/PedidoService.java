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

/** Compra, consulta y cancelación de pedidos, para el cliente y para el administrador. */
public interface PedidoService {

    /**
     * Convierte el carrito en pedido y lo cobra. En orden: valida sucursal, horario y cobertura,
     * crea el pedido pendiente y reserva el stock web; cobra fuera de la transacción; si el pago
     * falla cancela el pedido y devuelve las masas. El carrito solo se cierra si el pago se aprueba.
     */
    CheckoutResponse checkout(Long usuarioId, CheckoutRequest request);

    PageResponse<PedidoResumenResponse> misPedidos(Long usuarioId, Pageable pageable);

    PedidoResponse detalle(Long usuarioId, String numero);

    /** Etapas, reloj de cuenta regresiva y PIN de entrega. */
    SeguimientoResponse seguimiento(Long usuarioId, String numero);

    /** Cancela un pedido propio (solo antes de prepararse) y lo reembolsa si ya estaba pagado. */
    PedidoResponse cancelar(Long usuarioId, String numero, CancelarPedidoRequest request);

    /**
     * Búsqueda del administrador. Sin fechas usa los últimos 30 días. {@code texto} busca por
     * número de pedido o nombre del cliente.
     */
    PageResponse<PedidoResumenResponse> buscar(Long sucursalId, EstadoPedido estado, LocalDate desde, LocalDate hasta,
                                               String texto, Pageable pageable);

    PedidoResponse detalleAdmin(Long pedidoId);

    PedidoResponse cancelarAdmin(Long adminId, Long pedidoId, CancelarPedidoRequest request);
}
