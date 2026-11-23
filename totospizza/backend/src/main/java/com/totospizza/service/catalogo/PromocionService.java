package com.totospizza.service.catalogo;

import java.util.List;

import com.totospizza.dto.request.catalogo.CambiarDisponibilidadRequest;
import com.totospizza.dto.request.catalogo.PromocionRequest;
import com.totospizza.dto.response.catalogo.PromocionResponse;

/**
 * Promociones. Al guardar una oferta flash cuyo precio queda por debajo del costo estimado,
 * se avisa a los administradores (alerta de pérdida), pero no se bloquea el guardado: puede
 * ser una decisión deliberada para dar salida a una sobreproducción.
 */
public interface PromocionService {

    /** Activas y dentro de su vigencia, para el cliente. */
    List<PromocionResponse> vigentes();

    /** Todas, para el administrador. */
    List<PromocionResponse> listar();

    PromocionResponse crear(PromocionRequest request);

    PromocionResponse actualizar(Long id, PromocionRequest request);

    PromocionResponse cambiarActiva(Long id, CambiarDisponibilidadRequest request);

    /** Ofertas flash activas que se venden por debajo de su costo estimado. */
    List<PromocionResponse> enPerdida();
}
