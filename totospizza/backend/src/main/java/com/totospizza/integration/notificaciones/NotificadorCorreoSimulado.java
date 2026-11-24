package com.totospizza.integration.notificaciones;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import com.totospizza.config.CorreoProperties;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Sin servidor de correo configurado: escribe en el log el enlace que recibiría el usuario.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.correo", name = "habilitado", havingValue = "false", matchIfMissing = true)
public class NotificadorCorreoSimulado implements NotificadorCorreo {

    private final CorreoProperties propiedades;

    @Override
    public void enviarRecuperacionContrasena(String correo, String nombre, String token) {
        log.info("[correo simulado] Para {} ({}): abre {}", correo, nombre, propiedades.enlaceRecuperacion(token));
    }
}
