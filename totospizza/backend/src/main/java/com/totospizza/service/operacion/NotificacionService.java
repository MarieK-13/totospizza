package com.totospizza.service.operacion;

import org.springframework.data.domain.Pageable;

import com.totospizza.dto.common.PageResponse;
import com.totospizza.dto.response.operacion.NotificacionResponse;
import com.totospizza.model.enums.Rol;
import com.totospizza.model.enums.TipoNotificacion;

/**
 * Notificaciones internas (campana de la aplicación). Los métodos {@code notificar*} los usan
 * otros servicios; participan de la transacción de quien los llama, así que la notificación
 * se guarda solo si la operación que la originó se confirma.
 */
public interface NotificacionService {

    PageResponse<NotificacionResponse> listar(Long usuarioId, Pageable pageable);

    long contarNoLeidas(Long usuarioId);

    void marcarLeida(Long usuarioId, Long notificacionId);

    void marcarTodasLeidas(Long usuarioId);

    void notificarUsuario(Long usuarioId, TipoNotificacion tipo, String titulo, String mensaje);

    /**
     * Avisa a todos los usuarios activos del rol, de cualquier sucursal. Solo para avisos globales
     * del sistema (administradores, alertas generales); un evento de una sede usa
     * {@link #notificarRolEnSucursal}.
     */
    void notificarRol(Rol rol, TipoNotificacion tipo, String titulo, String mensaje);

    /** Avisa solo a los usuarios activos del rol que trabajan en esa sucursal. */
    void notificarRolEnSucursal(Rol rol, Long sucursalId, TipoNotificacion tipo, String titulo, String mensaje);
}
