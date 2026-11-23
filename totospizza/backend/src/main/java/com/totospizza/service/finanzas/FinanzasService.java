package com.totospizza.service.finanzas;

import java.time.LocalDate;

import org.springframework.data.domain.Pageable;

import com.totospizza.dto.common.PageResponse;
import com.totospizza.dto.request.finanzas.MovimientoFinancieroRequest;
import com.totospizza.dto.request.finanzas.RegistrarPagoMotorizadoRequest;
import com.totospizza.dto.response.finanzas.FinanzasResponse;
import com.totospizza.dto.response.finanzas.MovimientoFinancieroResponse;
import com.totospizza.dto.response.finanzas.PagoMotorizadoResponse;
import com.totospizza.dto.response.finanzas.ResumenAdminResponse;

/**
 * Dashboard del administrador: ganancias, ranking de productos y dinero adeudado a motorizados.
 * Las ganancias salen del libro de movimientos financieros (ingresos por ventas, egresos por
 * reembolsos y pagos al personal). Los rangos de fechas incluyen ambos extremos.
 */
public interface FinanzasService {

    /** Tarjetas del dashboard: ganancia semanal (desde el lunes), mensual y anual, y el día de hoy. */
    ResumenAdminResponse resumen(Long sucursalId);

    /** Reporte de un periodo de hasta un año. {@code sucursalId} null = todas. */
    FinanzasResponse reporte(Long sucursalId, LocalDate desde, LocalDate hasta);

    /** Sin fechas usa los últimos 30 días. */
    PageResponse<MovimientoFinancieroResponse> movimientos(Long sucursalId, LocalDate desde, LocalDate hasta,
                                                           Pageable pageable);

    MovimientoFinancieroResponse registrarMovimiento(Long usuarioId, MovimientoFinancieroRequest request);

    /**
     * Calcula lo que se le debe a un motorizado por un periodo (turnos finalizados × pago base
     * más entregas realizadas × bono) y lo deja como deuda pendiente.
     */
    PagoMotorizadoResponse liquidarMotorizado(RegistrarPagoMotorizadoRequest request);

    PageResponse<PagoMotorizadoResponse> pagosPendientes(Pageable pageable);

    /** Marca la deuda como pagada y registra el egreso. */
    PagoMotorizadoResponse marcarPagado(Long usuarioId, Long pagoId);
}
