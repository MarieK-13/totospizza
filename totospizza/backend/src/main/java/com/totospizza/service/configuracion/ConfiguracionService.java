package com.totospizza.service.configuracion;

import java.util.List;

import com.totospizza.dto.request.configuracion.MetodoPagoHabilitadoRequest;
import com.totospizza.dto.request.configuracion.ParametroSistemaRequest;
import com.totospizza.dto.request.configuracion.PerfilNegocioRequest;
import com.totospizza.dto.response.configuracion.ConfiguracionPublicaResponse;
import com.totospizza.dto.response.configuracion.MetodoPagoHabilitadoResponse;
import com.totospizza.dto.response.configuracion.ParametroSistemaResponse;
import com.totospizza.dto.response.configuracion.PerfilNegocioResponse;

/** Perfil del negocio, parámetros del sistema y métodos de pago habilitados. */
public interface ConfiguracionService {

    ConfiguracionPublicaResponse publica();

    PerfilNegocioResponse perfil();

    PerfilNegocioResponse actualizarPerfil(PerfilNegocioRequest request);

    List<ParametroSistemaResponse> parametros();

    ParametroSistemaResponse actualizarParametro(String clave, ParametroSistemaRequest request);

    List<MetodoPagoHabilitadoResponse> metodosPago();

    MetodoPagoHabilitadoResponse actualizarMetodoPago(MetodoPagoHabilitadoRequest request);
}
