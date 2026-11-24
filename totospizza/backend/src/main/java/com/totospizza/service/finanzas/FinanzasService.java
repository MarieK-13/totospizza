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


public interface FinanzasService {

    ResumenAdminResponse resumen(Long sucursalId);

    FinanzasResponse reporte(Long sucursalId, LocalDate desde, LocalDate hasta);

    PageResponse<MovimientoFinancieroResponse> movimientos(Long sucursalId, LocalDate desde, LocalDate hasta,
                                                           Pageable pageable);

    MovimientoFinancieroResponse registrarMovimiento(Long usuarioId, MovimientoFinancieroRequest request);

    PagoMotorizadoResponse liquidarMotorizado(RegistrarPagoMotorizadoRequest request);

    PageResponse<PagoMotorizadoResponse> pagosPendientes(Pageable pageable);

    PagoMotorizadoResponse marcarPagado(Long usuarioId, Long pagoId);
}
