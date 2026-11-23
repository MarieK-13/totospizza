package com.totospizza.service.pedido;

import com.totospizza.dto.request.pedido.ActualizarItemCarritoRequest;
import com.totospizza.dto.request.pedido.AgregarProductoRequest;
import com.totospizza.dto.response.pedido.CarritoResponse;

/**
 * Carrito activo del cliente (uno por usuario). Cada línea es un producto del menú (con tamaño,
 * masa y adicionales si es pizza), una pizza personalizada o una promoción. El precio se fija al
 * agregar la línea, desde el catálogo; el cliente nunca lo envía.
 *
 * <p>Los montos del carrito son una estimación con delivery: el costo real se calcula en el
 * checkout, cuando se conoce la dirección.
 */
public interface CarritoService {

    CarritoResponse obtener(Long usuarioId);

    CarritoResponse agregar(Long usuarioId, AgregarProductoRequest request);

    CarritoResponse actualizarItem(Long usuarioId, Long itemId, ActualizarItemCarritoRequest request);

    CarritoResponse quitarItem(Long usuarioId, Long itemId);

    CarritoResponse vaciar(Long usuarioId);
}
