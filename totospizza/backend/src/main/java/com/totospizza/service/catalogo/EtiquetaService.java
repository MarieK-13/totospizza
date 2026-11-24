package com.totospizza.service.catalogo;

import java.util.List;

import com.totospizza.dto.request.catalogo.EtiquetaRequest;
import com.totospizza.dto.response.catalogo.EtiquetaResponse;

/** Administración de etiquetas y alérgenos de los productos. */
public interface EtiquetaService {

    List<EtiquetaResponse> listar();

    EtiquetaResponse crear(EtiquetaRequest request);

    EtiquetaResponse actualizar(Long id, EtiquetaRequest request);

    void eliminar(Long id);
}
