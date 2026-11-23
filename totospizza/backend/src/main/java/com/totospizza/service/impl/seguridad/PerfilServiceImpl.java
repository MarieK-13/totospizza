package com.totospizza.service.impl.seguridad;

import java.time.Clock;
import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.request.seguridad.ActualizarPerfilRequest;
import com.totospizza.dto.request.seguridad.DireccionClienteRequest;
import com.totospizza.dto.response.seguridad.DireccionClienteResponse;
import com.totospizza.dto.response.seguridad.PerfilResponse;
import com.totospizza.exception.RecursoNoEncontradoException;
import com.totospizza.mapper.seguridad.DireccionMapper;
import com.totospizza.mapper.seguridad.UsuarioMapper;
import com.totospizza.model.entity.seguridad.DireccionCliente;
import com.totospizza.model.entity.seguridad.Usuario;
import com.totospizza.repository.seguridad.DireccionClienteRepository;
import com.totospizza.repository.seguridad.UsuarioRepository;
import com.totospizza.service.seguridad.PerfilService;

@Service
@RequiredArgsConstructor
@Transactional
public class PerfilServiceImpl implements PerfilService {

    private final UsuarioRepository usuarioRepository;
    private final DireccionClienteRepository direccionRepository;
    private final UsuarioMapper usuarioMapper;
    private final DireccionMapper direccionMapper;
    private final Clock clock;

    @Override
    @Transactional(readOnly = true)
    public PerfilResponse obtener(Long usuarioId) {
        return usuarioMapper.toPerfil(usuario(usuarioId), direccionRepository.findByUsuarioIdOrderByFavoritaDescCreadoEnDesc(usuarioId));
    }

    @Override
    public PerfilResponse actualizar(Long usuarioId, ActualizarPerfilRequest request) {
        Usuario usuario = usuario(usuarioId);
        usuarioMapper.updateEntity(request, usuario);
        return usuarioMapper.toPerfil(usuario, direccionRepository.findByUsuarioIdOrderByFavoritaDescCreadoEnDesc(usuarioId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<DireccionClienteResponse> listarDirecciones(Long usuarioId) {
        return direccionMapper.toResponses(direccionRepository.findByUsuarioIdOrderByFavoritaDescCreadoEnDesc(usuarioId));
    }

    @Override
    public DireccionClienteResponse agregarDireccion(Long usuarioId, DireccionClienteRequest request) {
        Usuario usuario = usuario(usuarioId);
        boolean primera = direccionRepository.findByUsuarioIdOrderByFavoritaDescCreadoEnDesc(usuarioId).isEmpty();
        boolean favorita = request.favorita() || primera;
        if (favorita) {
            direccionRepository.quitarFavorita(usuarioId, Instant.now(clock));
        }
        DireccionCliente direccion = direccionMapper.toEntity(request);
        direccion.setUsuario(usuario);
        direccion.setFavorita(favorita);
        return direccionMapper.toResponse(direccionRepository.save(direccion));
    }

    @Override
    public DireccionClienteResponse actualizarDireccion(Long usuarioId, Long direccionId, DireccionClienteRequest request) {
        DireccionCliente direccion = direccion(usuarioId, direccionId);
        if (request.favorita() && !direccion.isFavorita()) {
            direccionRepository.quitarFavorita(usuarioId, Instant.now(clock));
            direccion = direccion(usuarioId, direccionId);
        }
        direccionMapper.updateEntity(request, direccion);
        return direccionMapper.toResponse(direccion);
    }

    @Override
    public void eliminarDireccion(Long usuarioId, Long direccionId) {
        direccionRepository.delete(direccion(usuarioId, direccionId));
    }

    private Usuario usuario(Long usuarioId) {
        return usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario", usuarioId));
    }

    private DireccionCliente direccion(Long usuarioId, Long direccionId) {
        return direccionRepository.findByIdAndUsuarioId(direccionId, usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Dirección", direccionId));
    }
}
