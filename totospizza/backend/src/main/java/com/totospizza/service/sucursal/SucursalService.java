package com.totospizza.service.sucursal;

import java.util.List;

import com.totospizza.dto.request.catalogo.CambiarDisponibilidadRequest;
import com.totospizza.dto.request.sucursal.ConsultaCoberturaRequest;
import com.totospizza.dto.request.sucursal.SucursalRequest;
import com.totospizza.dto.response.sucursal.CoberturaResponse;
import com.totospizza.dto.response.sucursal.LocalesResponse;
import com.totospizza.dto.response.sucursal.SucursalResponse;

/**
 * Sucursales, horarios, zonas de reparto y cobertura. El delivery solo se permite dentro del
 * radio de cobertura de la sucursal (geolocalización estricta) para que el pedido llegue caliente.
 */
public interface SucursalService {

    /** Sucursales activas, para la página pública de locales. */
    LocalesResponse locales();

    SucursalResponse obtener(Long id);

    /**
     * Distancia, costo de envío y tiempo estimado hacia una dirección. Sin {@code sucursalId}
     * se evalúa la sucursal activa más cercana.
     */
    CoberturaResponse consultarCobertura(ConsultaCoberturaRequest request);

    /** Todas, incluidas las inactivas (administrador). */
    List<SucursalResponse> listar();

    SucursalResponse crear(SucursalRequest request);

    SucursalResponse actualizar(Long id, SucursalRequest request);

    SucursalResponse cambiarActiva(Long id, CambiarDisponibilidadRequest request);
}
