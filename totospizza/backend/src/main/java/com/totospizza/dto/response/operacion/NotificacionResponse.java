package com.totospizza.dto.response.operacion;

import java.time.Instant;

import com.totospizza.model.enums.TipoNotificacion;

/**
 * Notificación para un usuario.
 */
public record NotificacionResponse(
        Long id,
        TipoNotificacion tipo,
        String titulo,
        String mensaje,
        boolean leida,
        Instant creadoEn
) {
}
