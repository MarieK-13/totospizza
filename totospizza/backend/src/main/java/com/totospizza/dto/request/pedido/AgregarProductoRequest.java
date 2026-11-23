package com.totospizza.dto.request.pedido;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Agrega un ítem al carrito. Debe venir exactamente uno de productoId, pizzaPersonalizadaId o
 * promocionId (lo valida el servicio).
 */
public record AgregarProductoRequest(
        Long productoId,
        Long pizzaPersonalizadaId,
        Long promocionId,
        Long tamanoId,
        Long tipoMasaId,
        @NotNull @Min(1) @Max(20) Integer cantidad,
        @Size(max = 250) String notas,
        @Valid @Size(max = 10) List<AdicionalRequest> adicionales
) {
}
