package com.totospizza.service.operacion;

import java.util.List;

import com.totospizza.dto.request.operacion.AjusteInventarioRequest;
import com.totospizza.dto.response.operacion.InventarioIngredienteResponse;
import com.totospizza.model.entity.pedido.Pedido;
import com.totospizza.model.entity.sucursal.Sucursal;
import com.totospizza.model.enums.CanalInventario;

/**
 * Inventario por sucursal y canal. El canal ONLINE es el "stock web exclusivo": las masas que
 * el administrador destina solo a compras online, para no chocar con las ventas del local.
 */
public interface InventarioService {

    List<InventarioIngredienteResponse> listar(Long sucursalId, CanalInventario canal);

    List<InventarioIngredienteResponse> stockBajo(Long sucursalId, CanalInventario canal);

    /** Cantidad de ingredientes en o bajo su mínimo; sin sucursal cuenta todas. */
    long contarStockBajo(Long sucursalId);

    InventarioIngredienteResponse ajustar(Long inventarioId, Long usuarioId, AjusteInventarioRequest request);

    /**
     * Descuenta del stock web las masas que usa el pedido. Es atómico: dos pedidos simultáneos
     * no pueden llevarse la última masa. Si el stock web no está configurado, no hace nada.
     * Limpia el contexto de persistencia, por eso se llama al final de la operación.
     *
     * @throws com.totospizza.exception.ConflictoException si ya no quedan masas
     */
    /**
     * Crea, si no existen, las filas ONLINE de las masas para una sucursal nueva, con stock cero
     * hasta que el administrador destine masas. Sin esa fila la sucursal no podría vender online.
     */
    void inicializarStockWeb(Sucursal sucursal);

    /**
     * Descuenta las masas del pedido del stock web de su sucursal.
     *
     * @throws com.totospizza.exception.ReglaNegocioException STOCK_WEB_NO_CONFIGURADO si falta el parámetro
     *         {@code ingrediente_masa_id} o la fila ONLINE de la sucursal
     * @throws com.totospizza.exception.ConflictoException STOCK_WEB_AGOTADO si no alcanzan las masas
     */
    void reservarStockWeb(Pedido pedido);

    /** Devuelve las masas de un pedido cancelado. Se llama al final de la operación. */
    void reponerStockWeb(Pedido pedido);
}
