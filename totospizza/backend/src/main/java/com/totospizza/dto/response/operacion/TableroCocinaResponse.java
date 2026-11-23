package com.totospizza.dto.response.operacion;

import java.util.List;

/**
 * Tablero del pizzero.
 */
public record TableroCocinaResponse(
        List<TicketCocinaResponse> porPreparar,
        List<TicketCocinaResponse> enHorno
) {
}
