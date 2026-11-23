package com.totospizza.integration.pagos;

import java.math.BigDecimal;

/**
 * Puerto hacia la pasarela de pagos. Se llama siempre fuera de una transacción de base de
 * datos, porque es una llamada de red lenta. La implementación real (Culqi, Niubiz, Mercado
 * Pago) o una simulada para desarrollo se escribe en este mismo paquete.
 */
public interface PasarelaPago {

    /**
     * Cobra usando {@link SolicitudCobro#referencia()} como clave de idempotencia: repetir la misma
     * referencia nunca debe cobrar dos veces. Devuelve un resultado aprobado o rechazado; lanza una
     * excepción solo si no se sabe qué pasó (tiempo de espera, red caída), caso que el servicio de
     * pagos deja pendiente para conciliarlo después.
     */
    ResultadoCobro cobrar(SolicitudCobro solicitud);

    /** Estado actual de un cobro por la referencia del intento. */
    ResultadoConsulta consultar(String referenciaIntento);

    ResultadoReembolso reembolsar(String referenciaExterna, BigDecimal monto);
}
