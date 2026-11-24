package com.totospizza.rules.policy;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

import com.totospizza.exception.ReglaNegocioException;
import com.totospizza.model.enums.EstadoPedido;
import com.totospizza.model.enums.TipoEntrega;

/**
 *  Estados del pedido.
 **/

public final class PedidoEstadoPolicy {

    /** Estados de un pedido pagado y no anulado: cuentan como venta. */
    public static final Set<EstadoPedido> ESTADOS_VENTA = EnumSet.of(
            EstadoPedido.CONFIRMADO, EstadoPedido.EN_PREPARACION, EstadoPedido.EN_HORNO,
            EstadoPedido.LISTO, EstadoPedido.EN_CAMINO, EstadoPedido.ENTREGADO, EstadoPedido.NO_RECOGIDO);

    /** Estados que aparecen en la pantalla de cocina. */
    public static final Set<EstadoPedido> ESTADOS_COCINA = EnumSet.of(
            EstadoPedido.CONFIRMADO, EstadoPedido.EN_PREPARACION, EstadoPedido.EN_HORNO);

    private static final Map<EstadoPedido, Set<EstadoPedido>> TRANSICIONES = new EnumMap<>(EstadoPedido.class);

    static {
        TRANSICIONES.put(EstadoPedido.PENDIENTE_PAGO, EnumSet.of(EstadoPedido.CONFIRMADO, EstadoPedido.CANCELADO));
        TRANSICIONES.put(EstadoPedido.CONFIRMADO,
                EnumSet.of(EstadoPedido.EN_PREPARACION, EstadoPedido.EN_HORNO, EstadoPedido.CANCELADO));
        TRANSICIONES.put(EstadoPedido.EN_PREPARACION, EnumSet.of(EstadoPedido.EN_HORNO));
        TRANSICIONES.put(EstadoPedido.EN_HORNO, EnumSet.of(EstadoPedido.LISTO));
        TRANSICIONES.put(EstadoPedido.LISTO,
                EnumSet.of(EstadoPedido.EN_CAMINO, EstadoPedido.ENTREGADO, EstadoPedido.NO_RECOGIDO, EstadoPedido.CANCELADO));
        TRANSICIONES.put(EstadoPedido.EN_CAMINO, EnumSet.of(EstadoPedido.ENTREGADO));
    }

    private PedidoEstadoPolicy() {
    }

    public static boolean permitida(EstadoPedido actual, EstadoPedido nuevo, TipoEntrega tipoEntrega) {
        if (!TRANSICIONES.getOrDefault(actual, Set.of()).contains(nuevo)) {
            return false;
        }
        if (actual == EstadoPedido.LISTO && nuevo != EstadoPedido.CANCELADO) {
            boolean delivery = tipoEntrega == TipoEntrega.DELIVERY;
            return nuevo == EstadoPedido.EN_CAMINO ? delivery : !delivery;
        }
        return true;
    }

    public static void validar(EstadoPedido actual, EstadoPedido nuevo, TipoEntrega tipoEntrega) {
        if (!permitida(actual, nuevo, tipoEntrega)) {
            throw new ReglaNegocioException("TRANSICION_INVALIDA",
                    "No se puede pasar el pedido de " + actual.getEtiqueta() + " a " + nuevo.getEtiqueta());
        }
    }
}
