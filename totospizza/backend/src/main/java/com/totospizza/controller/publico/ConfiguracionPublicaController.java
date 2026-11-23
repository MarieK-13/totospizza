package com.totospizza.controller.publico;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.response.configuracion.ConfiguracionPublicaResponse;
import com.totospizza.dto.response.pago.MetodoPagoDisponibleResponse;
import com.totospizza.service.configuracion.ConfiguracionService;
import com.totospizza.service.pago.PagoService;

/** Datos públicos del negocio y métodos de pago habilitados. */
@RestController
@RequestMapping("/api/v1/publico")
@RequiredArgsConstructor
public class ConfiguracionPublicaController {

    private final ConfiguracionService configuracionService;
    private final PagoService pagoService;

    @GetMapping("/configuracion")
    public ConfiguracionPublicaResponse configuracion() {
        return configuracionService.publica();
    }

    @GetMapping("/metodos-pago")
    public List<MetodoPagoDisponibleResponse> metodosPago() {
        return pagoService.metodosDisponibles();
    }
}
