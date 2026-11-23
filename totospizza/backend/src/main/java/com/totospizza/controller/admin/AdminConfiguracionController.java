package com.totospizza.controller.admin;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.request.configuracion.MetodoPagoHabilitadoRequest;
import com.totospizza.dto.request.configuracion.ParametroSistemaRequest;
import com.totospizza.dto.request.configuracion.PerfilNegocioRequest;
import com.totospizza.dto.response.configuracion.MetodoPagoHabilitadoResponse;
import com.totospizza.dto.response.configuracion.ParametroSistemaResponse;
import com.totospizza.dto.response.configuracion.PerfilNegocioResponse;
import com.totospizza.service.configuracion.ConfiguracionService;

/** Perfil del negocio, parámetros del sistema y métodos de pago. */
@RestController
@RequestMapping("/api/v1/admin/configuracion")
@PreAuthorize("hasRole('ADMINISTRADOR')")
@RequiredArgsConstructor
public class AdminConfiguracionController {

    private final ConfiguracionService configuracionService;

    @GetMapping("/perfil")
    public PerfilNegocioResponse perfil() {
        return configuracionService.perfil();
    }

    @PutMapping("/perfil")
    public PerfilNegocioResponse actualizarPerfil(@Valid @RequestBody PerfilNegocioRequest request) {
        return configuracionService.actualizarPerfil(request);
    }

    @GetMapping("/parametros")
    public List<ParametroSistemaResponse> parametros() {
        return configuracionService.parametros();
    }

    @PutMapping("/parametros/{clave}")
    public ParametroSistemaResponse actualizarParametro(@PathVariable String clave,
                                                        @Valid @RequestBody ParametroSistemaRequest request) {
        return configuracionService.actualizarParametro(clave, request);
    }

    @GetMapping("/metodos-pago")
    public List<MetodoPagoHabilitadoResponse> metodosPago() {
        return configuracionService.metodosPago();
    }

    @PutMapping("/metodos-pago")
    public MetodoPagoHabilitadoResponse actualizarMetodoPago(@Valid @RequestBody MetodoPagoHabilitadoRequest request) {
        return configuracionService.actualizarMetodoPago(request);
    }
}
