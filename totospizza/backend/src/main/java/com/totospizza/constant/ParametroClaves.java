package com.totospizza.constant;

import java.math.BigDecimal;

public final class ParametroClaves {

    private ParametroClaves() {
    }

    /** Subtotal desde el cual el delivery es gratis. */
    public static final String ENVIO_GRATIS_DESDE = "envio_gratis_desde";
    public static final BigDecimal ENVIO_GRATIS_DESDE_DEFECTO = new BigDecimal("49.00");

    /** Costo de delivery cuando no hay zona de reparto configurada. */
    public static final String COSTO_DELIVERY_BASE = "costo_delivery_base";
    public static final BigDecimal COSTO_DELIVERY_BASE_DEFECTO = new BigDecimal("5.00");

    /** Radio de cobertura que se muestra si no hay sucursales activas. */
    public static final String RADIO_COBERTURA_KM = "radio_cobertura_km";
    public static final BigDecimal RADIO_COBERTURA_KM_DEFECTO = new BigDecimal("3.5");

    /** Minutos de cocina por pedido. */
    public static final String MINUTOS_PREPARACION = "minutos_preparacion";
    public static final int MINUTOS_PREPARACION_DEFECTO = 25;

    /** Minutos de viaje por kilómetro, para estimar el delivery. */
    public static final String MINUTOS_POR_KM = "minutos_por_km";
    public static final int MINUTOS_POR_KM_DEFECTO = 4;

    /** Minutos que un pedido para recoger espera en el mostrador antes de marcarse no recogido. */
    public static final String MINUTOS_VENCIMIENTO_RECOJO = "minutos_vencimiento_recojo";
    public static final int MINUTOS_VENCIMIENTO_RECOJO_DEFECTO = 90;

    /** Minutos que un pedido sin pago en curso espera antes de cancelarse y devolver las masas al stock web. */
    public static final String MINUTOS_EXPIRACION_PAGO = "minutos_expiracion_pago";
    public static final int MINUTOS_EXPIRACION_PAGO_DEFECTO = 15;

    /** Minutos de tolerancia sobre el tiempo estimado antes de aplicar la Garantía TOTO. */
    public static final String MINUTOS_TOLERANCIA_GARANTIA = "minutos_tolerancia_garantia";
    public static final int MINUTOS_TOLERANCIA_GARANTIA_DEFECTO = 10;

    /** Id del ingrediente que representa la masa en el inventario del canal ONLINE (stock web exclusivo). */
    public static final String INGREDIENTE_MASA_ID = "ingrediente_masa_id";
}
