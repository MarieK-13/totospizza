package com.totospizza.service.impl.seguridad;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.common.PageResponse;
import com.totospizza.dto.request.seguridad.AsignarHorarioRequest;
import com.totospizza.dto.request.seguridad.CambiarEstadoEmpleadoRequest;
import com.totospizza.dto.request.seguridad.EmpleadoRequest;
import com.totospizza.dto.response.operacion.TurnoResponse;
import com.totospizza.dto.response.seguridad.EmpleadoResponse;
import com.totospizza.dto.response.seguridad.ResumenEmpleadosResponse;
import com.totospizza.exception.ConflictoException;
import com.totospizza.exception.RecursoNoEncontradoException;
import com.totospizza.exception.ReglaNegocioException;
import com.totospizza.mapper.operacion.TurnoMapper;
import com.totospizza.mapper.seguridad.EmpleadoMapper;
import com.totospizza.model.embeddable.RangoHorario;
import com.totospizza.model.entity.operacion.Turno;
import com.totospizza.model.entity.seguridad.Empleado;
import com.totospizza.model.entity.seguridad.Usuario;
import com.totospizza.model.entity.sucursal.Sucursal;
import com.totospizza.model.enums.EstadoEmpleado;
import com.totospizza.model.enums.EstadoTurno;
import com.totospizza.model.enums.Rol;
import com.totospizza.repository.operacion.TurnoRepository;
import com.totospizza.repository.seguridad.EmpleadoRepository;
import com.totospizza.repository.seguridad.UsuarioRepository;
import com.totospizza.repository.seguridad.projection.EmpleadosPorEstado;
import com.totospizza.repository.sucursal.SucursalRepository;
import com.totospizza.service.seguridad.EmpleadoService;

@Service
@RequiredArgsConstructor
@Transactional
public class EmpleadoServiceImpl implements EmpleadoService {

    private static final Set<Rol> ROLES_DE_PERSONAL = Set.of(Rol.PIZZERO, Rol.DESPACHADOR, Rol.MOTORIZADO);

    private final EmpleadoRepository empleadoRepository;
    private final UsuarioRepository usuarioRepository;
    private final SucursalRepository sucursalRepository;
    private final TurnoRepository turnoRepository;
    private final EmpleadoMapper empleadoMapper;
    private final TurnoMapper turnoMapper;
    private final PasswordEncoder passwordEncoder;
    private final Clock clock;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<EmpleadoResponse> buscar(Long sucursalId, Rol rol, EstadoEmpleado estado, String texto, Pageable pageable) {
        String patron = "%" + (texto == null ? "" : texto.trim().toLowerCase(Locale.ROOT)) + "%";
        return PageResponse.of(empleadoRepository.buscar(sucursalId, rol, estado, patron, pageable)
                .map(empleadoMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public ResumenEmpleadosResponse resumen(Long sucursalId) {
        List<EmpleadosPorEstado> porEstado = empleadoRepository.contarPorEstado(sucursalId);
        return new ResumenEmpleadosResponse(
                empleadoRepository.countBySucursalId(sucursalId),
                cantidad(porEstado, EstadoEmpleado.ACTIVO),
                cantidad(porEstado, EstadoEmpleado.EN_TURNO),
                cantidad(porEstado, EstadoEmpleado.DISPONIBLE),
                cantidad(porEstado, EstadoEmpleado.INACTIVO),
                cantidad(porEstado, EstadoEmpleado.CON_LICENCIA));
    }

    @Override
    @Transactional(readOnly = true)
    public EmpleadoResponse obtener(Long empleadoId) {
        return empleadoMapper.toResponse(empleado(empleadoId));
    }

    @Override
    public EmpleadoResponse crear(EmpleadoRequest request) {
        validarRol(request.rol());
        if (request.contrasenaInicial() == null || request.contrasenaInicial().isBlank()) {
            throw new ReglaNegocioException("CONTRASENA_REQUERIDA", "Indica una contraseña inicial para el empleado");
        }
        String correo = normalizar(request.correo());
        validarCorreoLibre(correo, null);
        validarDocumentoLibre(request, null);

        Usuario usuario = empleadoMapper.toUsuario(request);
        usuario.setCorreo(correo);
        usuario.setContrasenaHash(passwordEncoder.encode(request.contrasenaInicial()));
        usuarioRepository.save(usuario);

        Empleado empleado = empleadoMapper.toEmpleado(request);
        empleado.setUsuario(usuario);
        empleado.setSucursal(sucursal(request.sucursalId()));
        empleado.setEstado(EstadoEmpleado.ACTIVO);
        return empleadoMapper.toResponse(empleadoRepository.save(empleado));
    }

    @Override
    public EmpleadoResponse actualizar(Long empleadoId, EmpleadoRequest request) {
        validarRol(request.rol());
        Empleado empleado = empleado(empleadoId);
        Usuario usuario = empleado.getUsuario();
        String correo = normalizar(request.correo());
        validarCorreoLibre(correo, usuario);
        validarDocumentoLibre(request, usuario);

        empleadoMapper.updateUsuario(request, usuario);
        usuario.setCorreo(correo);
        empleadoMapper.updateEmpleado(request, empleado);
        if (!empleado.getSucursal().getId().equals(request.sucursalId())) {
            empleado.setSucursal(sucursal(request.sucursalId()));
        }
        return empleadoMapper.toResponse(empleado);
    }

    @Override
    public EmpleadoResponse cambiarEstado(Long empleadoId, CambiarEstadoEmpleadoRequest request) {
        Empleado empleado = empleado(empleadoId);
        empleado.setEstado(request.estado());
        return empleadoMapper.toResponse(empleado);
    }

    @Override
    public TurnoResponse asignarHorario(Long empleadoId, AsignarHorarioRequest request) {
        if (request.horaInicio().equals(request.horaFin())) {
            throw new ReglaNegocioException("HORARIO_INVALIDO", "La hora de inicio y fin no pueden ser iguales");
        }
        RangoHorario horario = new RangoHorario();
        horario.setHoraInicio(request.horaInicio());
        horario.setHoraFin(request.horaFin());

        Turno turno = new Turno();
        turno.setEmpleado(empleado(empleadoId));
        turno.setSucursal(sucursal(request.sucursalId()));
        turno.setFecha(request.fecha());
        turno.setHorario(horario);
        turno.setEstado(EstadoTurno.PROGRAMADO);
        turno.setPuesto(request.puesto());
        return turnoMapper.toResponse(turnoRepository.save(turno));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TurnoResponse> turnos(Long empleadoId, LocalDate desde, LocalDate hasta) {
        if (desde.isAfter(hasta)) {
            throw new ReglaNegocioException("RANGO_INVALIDO", "La fecha inicial no puede ser posterior a la final");
        }
        return turnoMapper.toResponses(turnoRepository.findByEmpleadoIdAndFechaBetweenOrderByFechaAsc(empleadoId, desde, hasta));
    }

    @Override
    public int actualizarTurnos() {
        LocalDateTime ahora = LocalDateTime.now(clock);
        List<Turno> abiertos = turnoRepository.findByEstadoInAndFechaLessThanEqual(
                EnumSet.of(EstadoTurno.PROGRAMADO, EstadoTurno.EN_CURSO), ahora.toLocalDate());
        int cambiados = 0;
        for (Turno turno : abiertos) {
            EstadoTurno nuevo = estadoSegunHora(turno, ahora);
            if (nuevo != turno.getEstado()) {
                turno.setEstado(nuevo);
                cambiados++;
            }
        }
        return cambiados;
    }

    @Override
    public TurnoResponse cancelarTurno(Long empleadoId, Long turnoId) {
        Turno turno = turnoRepository.findById(turnoId)
                .filter(t -> t.getEmpleado().getId().equals(empleadoId))
                .orElseThrow(() -> new RecursoNoEncontradoException("Turno", turnoId));
        if (turno.getEstado() == EstadoTurno.CANCELADO) {
            throw new ReglaNegocioException("TURNO_CANCELADO", "Este turno ya estaba cancelado");
        }
        turno.setEstado(EstadoTurno.CANCELADO);
        return turnoMapper.toResponse(turno);
    }

    /** Un turno nocturno (fin menor o igual que inicio, p. ej. 18:00–02:00) termina al día siguiente. */
    private static EstadoTurno estadoSegunHora(Turno turno, LocalDateTime ahora) {
        RangoHorario horario = turno.getHorario();
        LocalDateTime inicio = turno.getFecha().atTime(horario.getHoraInicio());
        LocalDateTime fin = turno.getFecha().atTime(horario.getHoraFin());
        if (!fin.isAfter(inicio)) {
            fin = fin.plusDays(1);
        }
        if (!ahora.isBefore(fin)) {
            return EstadoTurno.FINALIZADO;
        }
        return ahora.isBefore(inicio) ? EstadoTurno.PROGRAMADO : EstadoTurno.EN_CURSO;
    }

    private static long cantidad(List<EmpleadosPorEstado> porEstado, EstadoEmpleado estado) {
        return porEstado.stream()
                .filter(p -> p.getEstado() == estado)
                .mapToLong(p -> p.getCantidad() == null ? 0 : p.getCantidad())
                .sum();
    }

    private static void validarRol(Rol rol) {
        if (!ROLES_DE_PERSONAL.contains(rol)) {
            throw new ReglaNegocioException("ROL_NO_PERMITIDO",
                    "Un empleado solo puede ser pizzero, despachador o motorizado");
        }
    }

    private void validarCorreoLibre(String correo, Usuario actual) {
        boolean cambia = actual == null || !correo.equalsIgnoreCase(actual.getCorreo());
        if (cambia && usuarioRepository.existsByCorreo(correo)) {
            throw new ConflictoException("CORREO_DUPLICADO", "Ya existe una cuenta con ese correo");
        }
    }

    private void validarDocumentoLibre(EmpleadoRequest request, Usuario actual) {
        boolean cambia = actual == null
                || actual.getDocumento() == null
                || actual.getDocumento().getTipo() != request.tipoDocumento()
                || !request.numeroDocumento().equals(actual.getDocumento().getNumero());
        if (cambia && usuarioRepository.existsByDocumentoTipoAndDocumentoNumero(request.tipoDocumento(), request.numeroDocumento())) {
            throw new ConflictoException("DOCUMENTO_DUPLICADO", "Ya existe una cuenta con ese documento");
        }
    }

    private Empleado empleado(Long id) {
        return empleadoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Empleado", id));
    }

    private Sucursal sucursal(Long id) {
        return sucursalRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Sucursal", id));
    }

    private static String normalizar(String correo) {
        return correo.trim().toLowerCase(Locale.ROOT);
    }
}
