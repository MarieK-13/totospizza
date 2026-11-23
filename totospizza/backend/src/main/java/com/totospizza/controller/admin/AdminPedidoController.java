package com.totospizza.controller.admin;

import java.time.LocalDate;

import jakarta.validation.Valid;

import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import com.totospizza.controller.comun.Paginas;
import com.totospizza.dto.common.PageResponse;
import com.totospizza.dto.request.operacion.CambiarEstadoPedidoRequest;
import com.totospizza.dto.request.pago.ReembolsoRequest;
import com.totospizza.dto.request.pedido.CancelarPedidoRequest;
import com.totospizza.dto.response.pago.PagoResponse;
import com.totospizza.dto.response.pedido.PedidoResponse;
import com.totospizza.dto.response.pedido.PedidoResumenResponse;
import com.totospizza.model.enums.EstadoPedido;
import com.totospizza.security.userdetails.UsuarioAutenticado;
import com.totospizza.service.pago.PagoService;
import com.totospizza.service.pedido.PedidoEstadoService;
import com.totospizza.service.pedido.PedidoService;

/** Panel de pedidos: búsqueda, cambio de estado, cancelación y reembolso. */
@RestController
@RequestMapping("/api/v1/admin/pedidos")
@PreAuthorize("hasRole('ADMINISTRADOR')")
@RequiredArgsConstructor
public class AdminPedidoController {

    private final PedidoService pedidoService;
    private final PedidoEstadoService pedidoEstadoService;
    private final PagoService pagoService;

    @GetMapping
    public PageResponse<PedidoResumenResponse> buscar(@RequestParam(required = false) Long sucursalId,
                                                      @RequestParam(required = false) EstadoPedido estado,
                                                      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
                                                      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
                                                      @RequestParam(name = "q", required = false) String texto,
                                                      @RequestParam(defaultValue = "0") int pagina,
                                                      @RequestParam(defaultValue = "20") int tamano) {
        return pedidoService.buscar(sucursalId, estado, desde, hasta, texto,
                Paginas.de(pagina, tamano, Sort.by(Sort.Direction.DESC, "creadoEn")));
    }

    @GetMapping("/{id}")
    public PedidoResponse detalle(@PathVariable Long id) {
        return pedidoService.detalleAdmin(id);
    }

    @PatchMapping("/{id}/estado")
    public PedidoResponse cambiarEstado(@AuthenticationPrincipal UsuarioAutenticado usuario,
                                        @PathVariable Long id,
                                        @Valid @RequestBody CambiarEstadoPedidoRequest request) {
        return pedidoEstadoService.cambiarEstado(id, usuario.id(), request);
    }

    @PostMapping("/{id}/cancelar")
    public PedidoResponse cancelar(@AuthenticationPrincipal UsuarioAutenticado usuario,
                                   @PathVariable Long id,
                                   @Valid @RequestBody CancelarPedidoRequest request) {
        return pedidoService.cancelarAdmin(usuario.id(), id, request);
    }

    @PostMapping("/{id}/reembolso")
    public PagoResponse reembolsar(@PathVariable Long id, @Valid @RequestBody ReembolsoRequest request) {
        return pagoService.reembolsar(id, request);
    }
}
