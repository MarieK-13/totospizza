package com.totospizza.integration.notificaciones;

/** Puerto para enviar correos transaccionales. */
public interface NotificadorCorreo {

    void enviarRecuperacionContrasena(String correo, String nombre, String token);
}
