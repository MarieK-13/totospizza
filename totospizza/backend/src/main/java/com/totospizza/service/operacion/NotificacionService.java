package com.totospizza.service.operacion;

import org.springframework.data.domain.Pageable;

import com.totospizza.dto.common.PageResponse;
import com.totospizza.dto.response.operacion.NotificacionResponse;
import com.totospizza.model.enums.Rol;
import com.totospizza.model.enums.TipoNotificacion;


public interface NotificacionService {

    PageResponse<NotificacionResponse> listar(Long usuarioId, Pageable pageable);

    long contarNoLeidas(Long usuarioId);

    void marcarLeida(Long usuarioId, Long notificacionId);

    void marcarTodasLeidas(Long usuarioId);

    void notificarUsuario(Long usuarioId, TipoNotificacion tipo, String titulo, String mensaje);

    void notificarRol(Rol rol, TipoNotificacion tipo, String titulo, String mensaje);

    void notificarRolEnSucursal(Rol rol, Long sucursalId, TipoNotificacion tipo, String titulo, String mensaje);
}
