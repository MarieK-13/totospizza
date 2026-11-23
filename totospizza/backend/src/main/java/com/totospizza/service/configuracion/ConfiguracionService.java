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

    /** Datos que el sitio público necesita: contacto, envío gratis, cobertura y métodos de pago. */
    ConfiguracionPublicaResponse publica();

    PerfilNegocioResponse perfil();

    PerfilNegocioResponse actualizarPerfil(PerfilNegocioRequest request);

    List<ParametroSistemaResponse> parametros();

    /** Cambia el valor de un parámetro validando que respete su tipo (número, booleano o texto). */
    ParametroSistemaResponse actualizarParametro(String clave, ParametroSistemaRequest request);

    List<MetodoPagoHabilitadoResponse> metodosPago();

    MetodoPagoHabilitadoResponse actualizarMetodoPago(MetodoPagoHabilitadoRequest request);
}
