package com.totospizza.controller.cliente;

import jakarta.validation.Valid;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import com.totospizza.controller.comun.Paginas;
import com.totospizza.dto.common.PageResponse;
import com.totospizza.dto.request.pedido.CancelarPedidoRequest;
import com.totospizza.dto.request.pedido.CheckoutRequest;
import com.totospizza.dto.response.pedido.CheckoutResponse;
import com.totospizza.dto.response.pedido.PedidoResponse;
import com.totospizza.dto.response.pedido.PedidoResumenResponse;
import com.totospizza.dto.response.pedido.SeguimientoResponse;
import com.totospizza.security.userdetails.UsuarioAutenticado;
import com.totospizza.service.pedido.PedidoService;

/** Compra, seguimiento y cancelación de pedidos del cliente. */
@RestController
@RequestMapping("/api/v1/cliente/pedidos")
@PreAuthorize("hasRole('CLIENTE')")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CheckoutResponse checkout(@AuthenticationPrincipal UsuarioAutenticado usuario,
                                     @Valid @RequestBody CheckoutRequest request) {
        return pedidoService.checkout(usuario.id(), request);
    }

    @GetMapping
    public PageResponse<PedidoResumenResponse> misPedidos(@AuthenticationPrincipal UsuarioAutenticado usuario,
                                                          @RequestParam(defaultValue = "0") int pagina,
                                                          @RequestParam(defaultValue = "20") int tamano) {
        return pedidoService.misPedidos(usuario.id(), Paginas.de(pagina, tamano, Sort.by(Sort.Direction.DESC, "creadoEn")));
    }

    @GetMapping("/{numero}")
    public PedidoResponse detalle(@AuthenticationPrincipal UsuarioAutenticado usuario, @PathVariable String numero) {
        return pedidoService.detalle(usuario.id(), numero);
    }

    @GetMapping("/{numero}/seguimiento")
    public SeguimientoResponse seguimiento(@AuthenticationPrincipal UsuarioAutenticado usuario,
                                           @PathVariable String numero) {
        return pedidoService.seguimiento(usuario.id(), numero);
    }

    @PostMapping("/{numero}/cancelar")
    public PedidoResponse cancelar(@AuthenticationPrincipal UsuarioAutenticado usuario,
                                   @PathVariable String numero,
                                   @Valid @RequestBody CancelarPedidoRequest request) {
        return pedidoService.cancelar(usuario.id(), numero, request);
    }
}
