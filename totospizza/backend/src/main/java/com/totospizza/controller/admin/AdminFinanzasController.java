package com.totospizza.controller.admin;

import java.time.LocalDate;

import jakarta.validation.Valid;

import org.springframework.format.annotation.DateTimeFormat;
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
import com.totospizza.dto.common.ConteoResponse;
import com.totospizza.dto.common.PageResponse;
import com.totospizza.dto.request.finanzas.MovimientoFinancieroRequest;
import com.totospizza.dto.request.finanzas.RegistrarPagoMotorizadoRequest;
import com.totospizza.dto.response.finanzas.FinanzasResponse;
import com.totospizza.dto.response.finanzas.MovimientoFinancieroResponse;
import com.totospizza.dto.response.finanzas.PagoMotorizadoResponse;
import com.totospizza.dto.response.finanzas.ResumenAdminResponse;
import com.totospizza.security.userdetails.UsuarioAutenticado;
import com.totospizza.service.finanzas.FinanzasService;
import com.totospizza.service.pago.PagoService;

/** Dashboard de ganancias, movimientos, deuda a motorizados y conciliación. */
@RestController
@RequestMapping("/api/v1/admin/finanzas")
@PreAuthorize("hasRole('ADMINISTRADOR')")
@RequiredArgsConstructor
public class AdminFinanzasController {

    private final FinanzasService finanzasService;
    private final PagoService pagoService;

    @GetMapping("/resumen")
    public ResumenAdminResponse resumen(@RequestParam(required = false) Long sucursalId) {
        return finanzasService.resumen(sucursalId);
    }

    @GetMapping("/reporte")
    public FinanzasResponse reporte(@RequestParam(required = false) Long sucursalId,
                                    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
                                    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return finanzasService.reporte(sucursalId, desde, hasta);
    }

    @GetMapping("/movimientos")
    public PageResponse<MovimientoFinancieroResponse> movimientos(@RequestParam(required = false) Long sucursalId,
                                                                  @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
                                                                  @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
                                                                  @RequestParam(defaultValue = "0") int pagina,
                                                                  @RequestParam(defaultValue = "20") int tamano) {
        return finanzasService.movimientos(sucursalId, desde, hasta, Paginas.de(pagina, tamano));
    }

    @PostMapping("/movimientos")
    @ResponseStatus(HttpStatus.CREATED)
    public MovimientoFinancieroResponse registrarMovimiento(@AuthenticationPrincipal UsuarioAutenticado usuario,
                                                            @Valid @RequestBody MovimientoFinancieroRequest request) {
        return finanzasService.registrarMovimiento(usuario.id(), request);
    }

    @PostMapping("/pagos-motorizado")
    @ResponseStatus(HttpStatus.CREATED)
    public PagoMotorizadoResponse liquidarMotorizado(@Valid @RequestBody RegistrarPagoMotorizadoRequest request) {
        return finanzasService.liquidarMotorizado(request);
    }

    @GetMapping("/pagos-motorizado/pendientes")
    public PageResponse<PagoMotorizadoResponse> pagosPendientes(@RequestParam(defaultValue = "0") int pagina,
                                                                @RequestParam(defaultValue = "20") int tamano) {
        return finanzasService.pagosPendientes(Paginas.de(pagina, tamano));
    }

    @PostMapping("/pagos-motorizado/{id}/pagar")
    public PagoMotorizadoResponse marcarPagado(@AuthenticationPrincipal UsuarioAutenticado usuario,
                                               @PathVariable Long id) {
        return finanzasService.marcarPagado(usuario.id(), id);
    }

    @PostMapping("/pagos/conciliar")
    public ConteoResponse conciliarPagos() {
        return new ConteoResponse(pagoService.conciliarPendientes());
    }
}
