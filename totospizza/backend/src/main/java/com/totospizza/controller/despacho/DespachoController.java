package com.totospizza.controller.despacho;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.request.operacion.AsignarMotorizadoRequest;
import com.totospizza.dto.response.operacion.EntregaResponse;
import com.totospizza.dto.response.operacion.PedidoListoResponse;
import com.totospizza.dto.response.seguridad.EmpleadoResponse;
import com.totospizza.security.userdetails.UsuarioAutenticado;
import com.totospizza.service.operacion.DespachoService;

/** Mostrador: entrega pedidos listos al cliente o al motorizado. */
@RestController
@RequestMapping("/api/v1/despacho")
@PreAuthorize("hasRole('DESPACHADOR')")
@RequiredArgsConstructor
public class DespachoController {

    private final DespachoService despachoService;

    @GetMapping("/pedidos-listos")
    public List<PedidoListoResponse> pedidosListos(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return despachoService.pedidosListos(usuario.id());
    }

    @GetMapping("/motorizados")
    public List<EmpleadoResponse> motorizadosDisponibles(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return despachoService.motorizadosDisponibles(usuario.id());
    }

    @PostMapping("/pedidos/{id}/asignar-motorizado")
    public EntregaResponse asignarMotorizado(@AuthenticationPrincipal UsuarioAutenticado usuario,
                                             @PathVariable Long id,
                                             @Valid @RequestBody AsignarMotorizadoRequest request) {
        return despachoService.asignarMotorizado(usuario.id(), id, request);
    }

    @PostMapping("/pedidos/{id}/entregar-en-mostrador")
    public PedidoListoResponse entregarEnMostrador(@AuthenticationPrincipal UsuarioAutenticado usuario,
                                                   @PathVariable Long id) {
        return despachoService.entregarEnMostrador(usuario.id(), id);
    }
}
