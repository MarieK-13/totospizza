package com.totospizza.controller.admin;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.common.ConteoResponse;
import com.totospizza.dto.request.operacion.AjusteInventarioRequest;
import com.totospizza.dto.response.operacion.InventarioIngredienteResponse;
import com.totospizza.model.enums.CanalInventario;
import com.totospizza.security.userdetails.UsuarioAutenticado;
import com.totospizza.service.operacion.InventarioService;

/** Inventario por sucursal y canal (local y stock web exclusivo). */
@RestController
@RequestMapping("/api/v1/admin/inventario")
@PreAuthorize("hasRole('ADMINISTRADOR')")
@RequiredArgsConstructor
public class AdminInventarioController {

    private final InventarioService inventarioService;

    @GetMapping
    public List<InventarioIngredienteResponse> listar(@RequestParam Long sucursalId,
                                                      @RequestParam CanalInventario canal) {
        return inventarioService.listar(sucursalId, canal);
    }

    @GetMapping("/stock-bajo")
    public List<InventarioIngredienteResponse> stockBajo(@RequestParam Long sucursalId,
                                                         @RequestParam CanalInventario canal) {
        return inventarioService.stockBajo(sucursalId, canal);
    }

    @GetMapping("/stock-bajo/conteo")
    public ConteoResponse contarStockBajo(@RequestParam(required = false) Long sucursalId) {
        return new ConteoResponse(inventarioService.contarStockBajo(sucursalId));
    }

    @PostMapping("/{id}/ajustes")
    public InventarioIngredienteResponse ajustar(@AuthenticationPrincipal UsuarioAutenticado usuario,
                                                 @PathVariable Long id,
                                                 @Valid @RequestBody AjusteInventarioRequest request) {
        return inventarioService.ajustar(id, usuario.id(), request);
    }
}
