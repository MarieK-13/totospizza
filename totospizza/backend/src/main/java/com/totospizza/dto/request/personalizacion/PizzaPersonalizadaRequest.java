package com.totospizza.dto.request.personalizacion;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * Pizza armada por el cliente paso a paso. Se usa para cotizar y para guardar.
 */
public record PizzaPersonalizadaRequest(
        @Size(max = 80) String nombre,
        @NotNull @Positive Long tamanoId,
        @NotNull @Positive Long tipoMasaId,
        @NotEmpty @Size(max = 2, message = "Máximo 2 quesos") List<Long> quesoIds,
        @NotNull @Size(max = 2, message = "Máximo 2 salsas") List<Long> salsaIds,
        @NotNull @Size(max = 2, message = "Máximo 2 ingredientes") List<Long> ingredienteIds
) {
}
