package com.totospizza.service.pedido;

import com.totospizza.dto.request.pedido.ActualizarItemCarritoRequest;
import com.totospizza.dto.request.pedido.AgregarProductoRequest;
import com.totospizza.dto.response.pedido.CarritoResponse;


public interface CarritoService {

    CarritoResponse obtener(Long usuarioId);

    CarritoResponse agregar(Long usuarioId, AgregarProductoRequest request);

    CarritoResponse actualizarItem(Long usuarioId, Long itemId, ActualizarItemCarritoRequest request);

    CarritoResponse quitarItem(Long usuarioId, Long itemId);

    CarritoResponse vaciar(Long usuarioId);
}
