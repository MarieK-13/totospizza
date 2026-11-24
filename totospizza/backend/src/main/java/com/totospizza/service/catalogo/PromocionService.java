package com.totospizza.service.catalogo;

import java.util.List;

import com.totospizza.dto.request.catalogo.CambiarDisponibilidadRequest;
import com.totospizza.dto.request.catalogo.PromocionRequest;
import com.totospizza.dto.response.catalogo.PromocionResponse;


public interface PromocionService {

    List<PromocionResponse> vigentes();

    List<PromocionResponse> listar();

    PromocionResponse crear(PromocionRequest request);

    PromocionResponse actualizar(Long id, PromocionRequest request);

    PromocionResponse cambiarActiva(Long id, CambiarDisponibilidadRequest request);

    List<PromocionResponse> enPerdida();
}
