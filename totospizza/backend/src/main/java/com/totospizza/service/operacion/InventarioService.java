package com.totospizza.service.operacion;

import java.util.List;

import com.totospizza.dto.request.operacion.AjusteInventarioRequest;
import com.totospizza.dto.response.operacion.InventarioIngredienteResponse;
import com.totospizza.model.entity.pedido.Pedido;
import com.totospizza.model.entity.sucursal.Sucursal;
import com.totospizza.model.enums.CanalInventario;

public interface InventarioService {

    List<InventarioIngredienteResponse> listar(Long sucursalId, CanalInventario canal);

    List<InventarioIngredienteResponse> stockBajo(Long sucursalId, CanalInventario canal);

    long contarStockBajo(Long sucursalId);

    InventarioIngredienteResponse ajustar(Long inventarioId, Long usuarioId, AjusteInventarioRequest request);

    void inicializarStockWeb(Sucursal sucursal);

    void reservarStockWeb(Pedido pedido);

    void reponerStockWeb(Pedido pedido);
}
