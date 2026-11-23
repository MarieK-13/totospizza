package com.totospizza.dto.request.pedido;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import com.totospizza.dto.request.pago.PagoRequest;
import com.totospizza.dto.request.seguridad.DireccionRequest;
import com.totospizza.model.enums.TipoEntrega;

/**
 * Confirma el carrito y paga online. El pago es obligatorio: no hay pago contra entrega.
 */
public record CheckoutRequest(
        @NotNull TipoEntrega tipoEntrega,
        @NotNull @Positive Long sucursalId,
        @Valid DireccionRequest direccionEntrega,
        @Size(max = 250) String instrucciones,
        @NotNull @Valid PagoRequest pago
) {
}
