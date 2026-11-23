package com.totospizza.controller.cliente;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.request.pedido.ActualizarItemCarritoRequest;
import com.totospizza.dto.request.pedido.AgregarProductoRequest;
import com.totospizza.dto.response.pedido.CarritoResponse;
import com.totospizza.security.userdetails.UsuarioAutenticado;
import com.totospizza.service.pedido.CarritoService;

/** Carrito del cliente. Los montos que devuelve son referenciales. */
@RestController
@RequestMapping("/api/v1/cliente/carrito")
@PreAuthorize("hasRole('CLIENTE')")
@RequiredArgsConstructor
public class CarritoController {

    private final CarritoService carritoService;

    @GetMapping
    public CarritoResponse obtener(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return carritoService.obtener(usuario.id());
    }

    @PostMapping("/items")
    @ResponseStatus(HttpStatus.CREATED)
    public CarritoResponse agregar(@AuthenticationPrincipal UsuarioAutenticado usuario,
                                   @Valid @RequestBody AgregarProductoRequest request) {
        return carritoService.agregar(usuario.id(), request);
    }

    @PutMapping("/items/{itemId}")
    public CarritoResponse actualizarItem(@AuthenticationPrincipal UsuarioAutenticado usuario,
                                          @PathVariable Long itemId,
                                          @Valid @RequestBody ActualizarItemCarritoRequest request) {
        return carritoService.actualizarItem(usuario.id(), itemId, request);
    }

    @DeleteMapping("/items/{itemId}")
    public CarritoResponse quitarItem(@AuthenticationPrincipal UsuarioAutenticado usuario,
                                      @PathVariable Long itemId) {
        return carritoService.quitarItem(usuario.id(), itemId);
    }

    @DeleteMapping
    public CarritoResponse vaciar(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return carritoService.vaciar(usuario.id());
    }
}
