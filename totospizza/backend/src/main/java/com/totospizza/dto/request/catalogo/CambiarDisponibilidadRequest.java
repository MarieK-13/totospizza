package com.totospizza.dto.request.catalogo;

import jakarta.validation.constraints.NotNull;

/**
 * Activa o desactiva la disponibilidad de un producto o ingrediente.
 */
public record CambiarDisponibilidadRequest(
        @NotNull Boolean disponible
) {
}
