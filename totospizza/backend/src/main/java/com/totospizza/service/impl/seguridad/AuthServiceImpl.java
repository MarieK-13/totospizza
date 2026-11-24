package com.totospizza.service.impl.seguridad;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.request.seguridad.CambiarContrasenaRequest;
import com.totospizza.dto.request.seguridad.LoginRequest;
import com.totospizza.dto.request.seguridad.OlvidoContrasenaRequest;
import com.totospizza.dto.request.seguridad.RefreshTokenRequest;
import com.totospizza.dto.request.seguridad.RegistroRequest;
import com.totospizza.dto.request.seguridad.RestablecerContrasenaRequest;
import com.totospizza.dto.response.seguridad.TokenResponse;
import com.totospizza.exception.AccesoDenegadoException;
import com.totospizza.exception.ConflictoException;
import com.totospizza.exception.NoAutenticadoException;
import com.totospizza.exception.RecursoNoEncontradoException;
import com.totospizza.exception.ReglaNegocioException;
import com.totospizza.integration.notificaciones.NotificadorCorreo;
import com.totospizza.mapper.seguridad.UsuarioMapper;
import com.totospizza.model.entity.seguridad.RefreshToken;
import com.totospizza.model.entity.seguridad.TokenRecuperacion;
import com.totospizza.model.entity.seguridad.Usuario;
import com.totospizza.model.enums.Rol;
import com.totospizza.repository.seguridad.RefreshTokenRepository;
import com.totospizza.repository.seguridad.TokenRecuperacionRepository;
import com.totospizza.repository.seguridad.UsuarioRepository;
import com.totospizza.security.jwt.JwtService;
import com.totospizza.service.seguridad.AuthService;
import com.totospizza.util.TokenUtil;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private static final Duration VIGENCIA_RECUPERACION = Duration.ofHours(1);

    private final UsuarioRepository usuarioRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenRecuperacionRepository tokenRecuperacionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final NotificadorCorreo notificadorCorreo;
    private final UsuarioMapper usuarioMapper;
    private final Clock clock;

    @Override
    public TokenResponse registrar(RegistroRequest request) {
        confirmarContrasena(request.contrasena(), request.confirmarContrasena());
        String correo = normalizar(request.correo());
        if (usuarioRepository.existsByCorreo(correo)) {
            throw new ConflictoException("CORREO_DUPLICADO", "Ya existe una cuenta con ese correo");
        }
        if (usuarioRepository.existsByDocumentoTipoAndDocumentoNumero(request.tipoDocumento(), request.numeroDocumento())) {
            throw new ConflictoException("DOCUMENTO_DUPLICADO", "Ya existe una cuenta con ese documento");
        }
        Usuario usuario = usuarioMapper.toEntity(request);
        usuario.setCorreo(correo);
        usuario.setRol(Rol.CLIENTE);
        usuario.setContrasenaHash(passwordEncoder.encode(request.contrasena()));
        usuarioRepository.save(usuario);
        return emitirTokens(usuario);
    }

    @Override
    public TokenResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByCorreo(normalizar(request.correo()))
                .orElseThrow(AuthServiceImpl::credencialesInvalidas);
        if (!passwordEncoder.matches(request.contrasena(), usuario.getContrasenaHash())) {
            throw credencialesInvalidas();
        }
        if (!usuario.isActivo()) {
            throw new AccesoDenegadoException("CUENTA_INACTIVA", "Tu cuenta está desactivada. Contacta al local.");
        }
        usuarioRepository.registrarAcceso(usuario.getId(), Instant.now(clock));
        return emitirTokens(usuario);
    }

    @Override
    @Transactional(noRollbackFor = NoAutenticadoException.class)
    public TokenResponse renovar(RefreshTokenRequest request) {
        Instant ahora = Instant.now(clock);
        RefreshToken token = refreshTokenRepository.findByTokenHash(TokenUtil.hash(request.refreshToken()))
                .orElseThrow(AuthServiceImpl::refreshInvalido);
        if (token.isRevocado()) {
            refreshTokenRepository.revocarTodosDelUsuario(token.getUsuario().getId(), ahora);
            throw refreshInvalido();
        }
        Usuario usuario = token.getUsuario();
        if (token.getExpiraEn().isBefore(ahora) || !usuario.isActivo()) {
            throw refreshInvalido();
        }
        token.setRevocado(true);
        return emitirTokens(usuario);
    }

    @Override
    public void cerrarSesion(Long usuarioId) {
        refreshTokenRepository.revocarTodosDelUsuario(usuarioId, Instant.now(clock));
    }

    @Override
    public void solicitarRecuperacion(OlvidoContrasenaRequest request) {
        usuarioRepository.findByCorreo(normalizar(request.correo())).ifPresent(usuario -> {
            String token = TokenUtil.generar();
            TokenRecuperacion recuperacion = new TokenRecuperacion();
            recuperacion.setUsuario(usuario);
            recuperacion.setTokenHash(TokenUtil.hash(token));
            recuperacion.setExpiraEn(Instant.now(clock).plus(VIGENCIA_RECUPERACION));
            tokenRecuperacionRepository.save(recuperacion);
            notificadorCorreo.enviarRecuperacionContrasena(usuario.getCorreo(), usuario.getNombres(), token);
        });
    }

    @Override
    public void restablecerContrasena(RestablecerContrasenaRequest request) {
        confirmarContrasena(request.nuevaContrasena(), request.confirmarContrasena());
        Instant ahora = Instant.now(clock);
        TokenRecuperacion recuperacion = tokenRecuperacionRepository
                .findByTokenHashAndUsadoEnIsNullAndExpiraEnAfter(TokenUtil.hash(request.token()), ahora)
                .orElseThrow(() -> new ReglaNegocioException("TOKEN_INVALIDO",
                        "El enlace de recuperación no es válido o ya venció"));
        Usuario usuario = recuperacion.getUsuario();
        usuario.setContrasenaHash(passwordEncoder.encode(request.nuevaContrasena()));
        recuperacion.setUsadoEn(ahora);
        refreshTokenRepository.revocarTodosDelUsuario(usuario.getId(), ahora);
    }

    @Override
    public void cambiarContrasena(Long usuarioId, CambiarContrasenaRequest request) {
        confirmarContrasena(request.nuevaContrasena(), request.confirmarContrasena());
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario", usuarioId));
        if (!passwordEncoder.matches(request.contrasenaActual(), usuario.getContrasenaHash())) {
            throw new ReglaNegocioException("CONTRASENA_ACTUAL_INCORRECTA", "La contraseña actual no es correcta");
        }
        usuario.setContrasenaHash(passwordEncoder.encode(request.nuevaContrasena()));
        refreshTokenRepository.revocarTodosDelUsuario(usuarioId, Instant.now(clock));
    }

    private TokenResponse emitirTokens(Usuario usuario) {
        String refresh = TokenUtil.generar();
        RefreshToken token = new RefreshToken();
        token.setUsuario(usuario);
        token.setTokenHash(TokenUtil.hash(refresh));
        token.setExpiraEn(Instant.now(clock).plus(jwtService.getDuracionRefresh()));
        refreshTokenRepository.save(token);
        return new TokenResponse(jwtService.generarAccessToken(usuario), refresh, "Bearer",
                jwtService.getExpiracionSegundos(), usuarioMapper.toResponse(usuario));
    }

    private static void confirmarContrasena(String contrasena, String confirmacion) {
        if (!contrasena.equals(confirmacion)) {
            throw new ReglaNegocioException("CONTRASENAS_NO_COINCIDEN", "Las contraseñas no coinciden");
        }
    }

    private static String normalizar(String correo) {
        return correo.trim().toLowerCase(Locale.ROOT);
    }

    private static NoAutenticadoException credencialesInvalidas() {
        return new NoAutenticadoException("CREDENCIALES_INVALIDAS", "Correo o contraseña incorrectos");
    }

    private static NoAutenticadoException refreshInvalido() {
        return new NoAutenticadoException("REFRESH_INVALIDO", "La sesión expiró. Inicia sesión nuevamente.");
    }
}
