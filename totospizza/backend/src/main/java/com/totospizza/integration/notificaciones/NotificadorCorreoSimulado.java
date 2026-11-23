package com.totospizza.integration.notificaciones;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

/**
 * No envía correos: escribe en el log lo que se enviaría, para probar la recuperación de contraseña
 * en desarrollo. No existe en producción ({@code prod}), donde debe entrar la implementación SMTP.
 */
@Slf4j
@Component
@Profile("!prod")
public class NotificadorCorreoSimulado implements NotificadorCorreo {

    @Override
    public void enviarRecuperacionContrasena(String correo, String nombre, String token) {
        log.info("[correo simulado] Para {} ({}): token de recuperación {}", correo, nombre, token);
    }
}
