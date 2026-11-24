package com.totospizza.rules.calculator;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import com.totospizza.dto.response.pedido.EtapaSeguimientoResponse;
import com.totospizza.dto.response.pedido.SeguimientoResponse;
import com.totospizza.mapper.MapeoUtils;
import com.totospizza.model.entity.operacion.Entrega;
import com.totospizza.model.entity.pedido.Pedido;
import com.totospizza.model.entity.pedido.PedidoEstadoHistorial;
import com.totospizza.model.enums.EstadoPedido;
import com.totospizza.model.enums.TipoEntrega;

/**
 * Arma el seguimiento que ve el cliente: 4 etapas y el reloj de cuenta regresiva.
 **/
public final class CalculadoraSeguimiento {

    private CalculadoraSeguimiento() {
    }

    public static SeguimientoResponse construir(Pedido pedido, List<PedidoEstadoHistorial> historial,
                                                Entrega entrega, Instant ahora) {
        int nivel = nivel(pedido.getEstado());
        boolean delivery = pedido.getTipoEntrega() == TipoEntrega.DELIVERY;
        // En delivery, LISTO todavía espera al motorizado: se muestra así hasta que sale (EN_CAMINO).
        String tercera = !delivery ? "Listo para recoger"
                : pedido.getEstado() == EstadoPedido.LISTO ? "Esperando motorizado" : "En camino";

        List<EtapaSeguimientoResponse> etapas = new ArrayList<>();
        Instant fechaTercera = primeraFecha(historial, delivery ? Set.of(EstadoPedido.EN_CAMINO) : Set.of(EstadoPedido.LISTO));
        etapas.add(etapa("Pedido confirmado", 1, nivel, pedido.getConfirmadoEn(), true));
        etapas.add(etapa("En preparación", 2, nivel,
                primeraFecha(historial, Set.of(EstadoPedido.EN_PREPARACION, EstadoPedido.EN_HORNO)), false));
        etapas.add(etapa(tercera, 3, nivel, fechaTercera, fechaTercera != null));
        etapas.add(etapa("Entregado", 4, nivel, pedido.getEntregadoEn(), true));

        boolean enCurso = nivel >= 1 && nivel <= 3;
        Instant entregaEstimada = entregaEstimada(pedido);
        int minutosRestantes = enCurso && entregaEstimada != null
                ? (int) Math.max(0, Duration.between(ahora, entregaEstimada).toMinutes())
                : 0;
        String codigo = delivery && enCurso && entrega != null ? entrega.getCodigoPin() : null;

        return new SeguimientoResponse(pedido.getId(), pedido.getNumero(), pedido.getEstado(), etapas,
                minutosRestantes, entregaEstimada, codigo, MapeoUtils.nombreMotorizado(entrega),
                pedido.isGarantiaAplicada());
    }

    /**
     * {@code alcanzarCompleta}: la etapa es un hecho (se confirmó, quedó listo, salió) y queda completa
     * en cuanto se alcanza; las que son un proceso (en preparación) se completan al pasar a la siguiente.
     */
    private static EtapaSeguimientoResponse etapa(String nombre, int numero, int nivel, Instant fecha,
                                                  boolean alcanzarCompleta) {
        boolean completada = nivel > numero || (nivel == numero && alcanzarCompleta);
        boolean actual = nivel == numero && numero < 4;
        return new EtapaSeguimientoResponse(nombre, completada, actual, fecha);
    }

    private static Instant primeraFecha(List<PedidoEstadoHistorial> historial, Set<EstadoPedido> estados) {
        return historial.stream()
                .filter(h -> estados.contains(h.getEstado()))
                .map(PedidoEstadoHistorial::getCreadoEn)
                .filter(f -> f != null)
                .min(Instant::compareTo)
                .orElse(null);
    }

    private static Instant entregaEstimada(Pedido pedido) {
        if (pedido.getConfirmadoEn() == null || pedido.getMinutosEstimados() == null) {
            return null;
        }
        return pedido.getConfirmadoEn().plus(Duration.ofMinutes(pedido.getMinutosEstimados()));
    }

    private static int nivel(EstadoPedido estado) {
        return switch (estado) {
            case CONFIRMADO -> 1;
            case EN_PREPARACION, EN_HORNO -> 2;
            case LISTO, EN_CAMINO -> 3;
            case ENTREGADO -> 4;
            case PENDIENTE_PAGO, CANCELADO, NO_RECOGIDO -> 0;
        };
    }
}
