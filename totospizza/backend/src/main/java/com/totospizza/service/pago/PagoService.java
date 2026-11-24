package com.totospizza.service.pago;

import java.util.List;

import com.totospizza.dto.request.pago.PagoRequest;
import com.totospizza.dto.request.pago.ReembolsoRequest;
import com.totospizza.dto.response.pago.MetodoPagoDisponibleResponse;
import com.totospizza.dto.response.pago.PagoResponse;

public interface PagoService {

    List<MetodoPagoDisponibleResponse> metodosDisponibles();

    void validarMetodo(PagoRequest request);

    PagoResponse cobrar(Long usuarioId, Long pedidoId, PagoRequest request);

    PagoResponse reembolsar(Long pedidoId, ReembolsoRequest request);

    void reembolsarCancelacion(Long pedidoId, String motivo);

    int conciliarPendientes();
}
