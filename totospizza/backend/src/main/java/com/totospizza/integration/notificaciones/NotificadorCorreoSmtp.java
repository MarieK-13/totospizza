package com.totospizza.integration.notificaciones;

import java.nio.charset.StandardCharsets;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.util.HtmlUtils;

import com.totospizza.config.CorreoProperties;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Envía los correos por SMTP (por ejemplo Gmail con contraseña de aplicación).
 * Un fallo se registra en el log y no se devuelve al cliente, para no revelar si el correo existe.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.correo", name = "habilitado", havingValue = "true")
public class NotificadorCorreoSmtp implements NotificadorCorreo {

    private static final String ASUNTO_RECUPERACION = "Crea tu nueva contraseña de Toto's Pizza";

    private final JavaMailSender mailSender;
    private final CorreoProperties propiedades;

    @Async
    @Override
    public void enviarRecuperacionContrasena(String correo, String nombre, String token) {
        String enlace = propiedades.enlaceRecuperacion(token);
        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, StandardCharsets.UTF_8.name());
            helper.setFrom(propiedades.remitente(), propiedades.nombreRemitente());
            helper.setTo(correo);
            helper.setSubject(ASUNTO_RECUPERACION);
            helper.setText(textoPlano(nombre, enlace), html(nombre, enlace));
            mailSender.send(mensaje);
            log.info("Correo de recuperación enviado a {}", correo);
        } catch (MessagingException | MailException | java.io.UnsupportedEncodingException e) {
            log.error("No se pudo enviar el correo de recuperación a {}: {}", correo, e.getMessage());
        }
    }

    private static String textoPlano(String nombre, String enlace) {
        return """
                Hola %s:

                Recibimos una solicitud para cambiar la contraseña de tu cuenta en Toto's Pizza.
                Crea una nueva desde este enlace (vence en 1 hora):

                %s

                Si no fuiste tú, ignora este correo: tu contraseña actual sigue funcionando.
                """.formatted(nombre, enlace);
    }

    private static String html(String nombre, String enlace) {
        String nombreSeguro = HtmlUtils.htmlEscape(nombre);
        String enlaceSeguro = HtmlUtils.htmlEscape(enlace);
        return """
                <!DOCTYPE html>
                <html lang="es">
                <body style="margin:0;padding:24px 12px;background:#f6efe4;font-family:Arial,Helvetica,sans-serif;color:#231812;">
                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0">
                    <tr><td align="center">
                      <table role="presentation" width="100%%" cellpadding="0" cellspacing="0"
                             style="max-width:520px;background:#fffdf9;border-radius:16px;padding:32px;">
                        <tr><td>
                          <p style="margin:0 0 4px;font-size:13px;color:#d32f2f;font-weight:bold;">Toto's Pizza</p>
                          <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:26px;font-weight:normal;">Crea tu nueva contraseña</h1>
                          <p style="margin:0 0 12px;font-size:15px;line-height:1.5;">Hola %s:</p>
                          <p style="margin:0 0 24px;font-size:15px;line-height:1.5;">
                            Recibimos una solicitud para cambiar la contraseña de tu cuenta. El enlace vence en 1 hora.
                          </p>
                          <p style="margin:0 0 24px;">
                            <a href="%s" style="display:inline-block;padding:13px 26px;border-radius:999px;background:#d32f2f;color:#ffffff;font-weight:bold;font-size:15px;text-decoration:none;">Crear contraseña nueva</a>
                          </p>
                          <p style="margin:0 0 8px;font-size:12px;color:#7a6a5e;">Si el botón no abre, copia este enlace en tu navegador:</p>
                          <p style="margin:0 0 24px;font-size:12px;word-break:break-all;"><a href="%s" style="color:#d32f2f;">%s</a></p>
                          <p style="margin:0;font-size:12px;color:#7a6a5e;">Si no fuiste tú, ignora este correo: tu contraseña actual sigue funcionando.</p>
                        </td></tr>
                      </table>
                    </td></tr>
                  </table>
                </body>
                </html>
                """.formatted(nombreSeguro, enlaceSeguro, enlaceSeguro, enlaceSeguro);
    }
}
