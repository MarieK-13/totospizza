package com.totospizza.integration.notificaciones;

/** Puerto para enviar correos transaccionales. La implementación SMTP se escribe después. */
public interface NotificadorCorreo {

    /** Envía el enlace o token para restablecer la contraseña. */
    void enviarRecuperacionContrasena(String correo, String nombre, String token);
}
