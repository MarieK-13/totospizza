package com.totospizza.service.catalogo;

import java.util.List;

import com.totospizza.dto.request.catalogo.CambiarDisponibilidadRequest;
import com.totospizza.dto.request.catalogo.PromocionRequest;
import com.totospizza.dto.response.catalogo.PromocionAdminResponse;
import com.totospizza.dto.response.catalogo.PromocionResponse;


public interface PromocionService {

    List<PromocionResponse> vigentes();

    List<PromocionAdminResponse> listar();

    PromocionAdminResponse crear(PromocionRequest request);

    PromocionAdminResponse actualizar(Long id, PromocionRequest request);

    PromocionAdminResponse cambiarActiva(Long id, CambiarDisponibilidadRequest request);

    List<PromocionAdminResponse> enPerdida();
}
