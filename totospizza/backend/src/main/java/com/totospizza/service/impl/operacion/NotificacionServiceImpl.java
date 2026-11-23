package com.totospizza.service.impl.operacion;

import java.time.Clock;
import java.time.Instant;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.common.PageResponse;
import com.totospizza.dto.response.operacion.NotificacionResponse;
import com.totospizza.exception.RecursoNoEncontradoException;
import com.totospizza.mapper.operacion.NotificacionMapper;
import com.totospizza.model.entity.operacion.Notificacion;
import com.totospizza.model.entity.seguridad.Usuario;
import com.totospizza.model.enums.Rol;
import com.totospizza.model.enums.TipoNotificacion;
import com.totospizza.repository.operacion.NotificacionRepository;
import com.totospizza.repository.seguridad.EmpleadoRepository;
import com.totospizza.repository.seguridad.UsuarioRepository;
import com.totospizza.service.operacion.NotificacionService;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificacionServiceImpl implements NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final UsuarioRepository usuarioRepository;
    private final EmpleadoRepository empleadoRepository;
    private final NotificacionMapper notificacionMapper;
    private final Clock clock;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificacionResponse> listar(Long usuarioId, Pageable pageable) {
        return PageResponse.of(notificacionRepository.findByUsuarioIdOrderByCreadoEnDesc(usuarioId, pageable)
                .map(notificacionMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public long contarNoLeidas(Long usuarioId) {
        return notificacionRepository.countByUsuarioIdAndLeidaFalse(usuarioId);
    }

    @Override
    public void marcarLeida(Long usuarioId, Long notificacionId) {
        Notificacion notificacion = notificacionRepository.findById(notificacionId)
                .filter(n -> n.getUsuario().getId().equals(usuarioId))
                .orElseThrow(() -> new RecursoNoEncontradoException("Notificación", notificacionId));
        if (!notificacion.isLeida()) {
            notificacion.setLeida(true);
            notificacion.setLeidaEn(Instant.now(clock));
        }
    }

    @Override
    public void marcarTodasLeidas(Long usuarioId) {
        notificacionRepository.marcarTodasLeidas(usuarioId, Instant.now(clock));
    }

    @Override
    public void notificarUsuario(Long usuarioId, TipoNotificacion tipo, String titulo, String mensaje) {
        notificacionRepository.save(nueva(usuarioRepository.getReferenceById(usuarioId), tipo, titulo, mensaje));
    }

    @Override
    public void notificarRol(Rol rol, TipoNotificacion tipo, String titulo, String mensaje) {
        List<Notificacion> notificaciones = usuarioRepository.findByRolAndActivoTrue(rol).stream()
                .map(usuario -> nueva(usuario, tipo, titulo, mensaje))
                .toList();
        notificacionRepository.saveAll(notificaciones);
    }

    @Override
    public void notificarRolEnSucursal(Rol rol, Long sucursalId, TipoNotificacion tipo, String titulo, String mensaje) {
        List<Notificacion> notificaciones = empleadoRepository.findUsuariosActivosPorRolYSucursal(rol, sucursalId).stream()
                .map(usuario -> nueva(usuario, tipo, titulo, mensaje))
                .toList();
        notificacionRepository.saveAll(notificaciones);
    }

    private static Notificacion nueva(Usuario usuario, TipoNotificacion tipo, String titulo, String mensaje) {
        Notificacion notificacion = new Notificacion();
        notificacion.setUsuario(usuario);
        notificacion.setTipo(tipo);
        notificacion.setTitulo(titulo);
        notificacion.setMensaje(mensaje);
        return notificacion;
    }
}
