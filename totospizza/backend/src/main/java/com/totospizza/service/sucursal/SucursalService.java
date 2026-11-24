package com.totospizza.service.sucursal;

import java.util.List;

import com.totospizza.dto.request.catalogo.CambiarDisponibilidadRequest;
import com.totospizza.dto.request.sucursal.ConsultaCoberturaRequest;
import com.totospizza.dto.request.sucursal.SucursalRequest;
import com.totospizza.dto.response.sucursal.CoberturaResponse;
import com.totospizza.dto.response.sucursal.LocalesResponse;
import com.totospizza.dto.response.sucursal.SucursalResponse;

public interface SucursalService {

    LocalesResponse locales();

    SucursalResponse obtener(Long id);

    CoberturaResponse consultarCobertura(ConsultaCoberturaRequest request);

    List<SucursalResponse> listar();

    SucursalResponse crear(SucursalRequest request);

    SucursalResponse actualizar(Long id, SucursalRequest request);

    SucursalResponse cambiarActiva(Long id, CambiarDisponibilidadRequest request);
}
