package com.totospizza.service.impl.configuracion;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import com.totospizza.constant.ParametroClaves;
import com.totospizza.dto.request.configuracion.MetodoPagoHabilitadoRequest;
import com.totospizza.dto.request.configuracion.ParametroSistemaRequest;
import com.totospizza.dto.request.configuracion.PerfilNegocioRequest;
import com.totospizza.dto.response.configuracion.ConfiguracionPublicaResponse;
import com.totospizza.dto.response.configuracion.MetodoPagoHabilitadoResponse;
import com.totospizza.dto.response.configuracion.ParametroSistemaResponse;
import com.totospizza.dto.response.configuracion.PerfilNegocioResponse;
import com.totospizza.exception.RecursoNoEncontradoException;
import com.totospizza.exception.ReglaNegocioException;
import com.totospizza.mapper.configuracion.ConfiguracionMapper;
import com.totospizza.model.entity.configuracion.MetodoPagoHabilitado;
import com.totospizza.model.entity.configuracion.ParametroSistema;
import com.totospizza.model.entity.configuracion.PerfilNegocio;
import com.totospizza.model.entity.sucursal.Sucursal;
import com.totospizza.repository.configuracion.MetodoPagoHabilitadoRepository;
import com.totospizza.repository.configuracion.ParametroSistemaRepository;
import com.totospizza.repository.configuracion.PerfilNegocioRepository;
import com.totospizza.repository.sucursal.SucursalRepository;
import com.totospizza.service.configuracion.ConfiguracionService;
import com.totospizza.service.configuracion.ParametrosService;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ConfiguracionServiceImpl implements ConfiguracionService {

    private static final String NOMBRE_COMERCIAL_DEFECTO = "Toto's Pizza";

    private final PerfilNegocioRepository perfilRepository;
    private final ParametroSistemaRepository parametroRepository;
    private final MetodoPagoHabilitadoRepository metodoPagoRepository;
    private final SucursalRepository sucursalRepository;
    private final ParametrosService parametros;
    private final ConfiguracionMapper mapper;

    @Override
    public ConfiguracionPublicaResponse publica() {
        PerfilNegocio perfil = perfilRepository.findFirstByOrderByIdAsc().orElseGet(PerfilNegocio::new);
        String nombre = perfil.getNombreComercial() != null ? perfil.getNombreComercial() : NOMBRE_COMERCIAL_DEFECTO;
        return new ConfiguracionPublicaResponse(
                nombre,
                perfil.getLogoUrl(),
                perfil.getWhatsapp(),
                perfil.getInstagramUrl(),
                perfil.getFacebookUrl(),
                parametros.numero(ParametroClaves.ENVIO_GRATIS_DESDE, ParametroClaves.ENVIO_GRATIS_DESDE_DEFECTO),
                parametros.numero(ParametroClaves.COSTO_DELIVERY_BASE, ParametroClaves.COSTO_DELIVERY_BASE_DEFECTO),
                radioCobertura(),
                mapper.toDisponibles(metodoPagoRepository.findByActivoTrueOrderByOrdenAsc()));
    }

    @Override
    public PerfilNegocioResponse perfil() {
        return perfilRepository.findFirstByOrderByIdAsc()
                .map(mapper::toResponse)
                .orElseThrow(() -> new RecursoNoEncontradoException("Perfil del negocio", "configuración inicial"));
    }

    @Override
    @Transactional
    public PerfilNegocioResponse actualizarPerfil(PerfilNegocioRequest request) {
        PerfilNegocio perfil = perfilRepository.findFirstByOrderByIdAsc().orElseGet(PerfilNegocio::new);
        mapper.updateEntity(request, perfil);
        return mapper.toResponse(perfilRepository.save(perfil));
    }

    @Override
    public List<ParametroSistemaResponse> parametros() {
        return mapper.toParametros(parametroRepository.findAllByOrderByClaveAsc());
    }

    @Override
    @Transactional
    public ParametroSistemaResponse actualizarParametro(String clave, ParametroSistemaRequest request) {
        ParametroSistema parametro = parametroRepository.findByClave(clave)
                .orElseThrow(() -> new RecursoNoEncontradoException("Parámetro", clave));
        validarTipo(parametro, request.valor());
        mapper.updateEntity(request, parametro);
        return mapper.toResponse(parametro);
    }

    @Override
    public List<MetodoPagoHabilitadoResponse> metodosPago() {
        return mapper.toMetodos(metodoPagoRepository.findAllByOrderByOrdenAsc());
    }

    @Override
    @Transactional
    public MetodoPagoHabilitadoResponse actualizarMetodoPago(MetodoPagoHabilitadoRequest request) {
        MetodoPagoHabilitado habilitado = metodoPagoRepository.findByMetodo(request.metodo())
                .orElseGet(MetodoPagoHabilitado::new);
        mapper.updateEntity(request, habilitado);
        return mapper.toResponse(metodoPagoRepository.save(habilitado));
    }

    private BigDecimal radioCobertura() {
        return sucursalRepository.findByActivaTrueOrderByNombreAsc().stream()
                .map(Sucursal::getRadioCoberturaKm)
                .filter(r -> r != null)
                .max(BigDecimal::compareTo)
                .orElseGet(() -> parametros.numero(ParametroClaves.RADIO_COBERTURA_KM,
                        ParametroClaves.RADIO_COBERTURA_KM_DEFECTO));
    }

    private void validarTipo(ParametroSistema parametro, String valor) {
        switch (parametro.getTipo()) {
            case NUMERO -> {
                try {
                    new BigDecimal(valor.trim());
                } catch (NumberFormatException e) {
                    throw new ReglaNegocioException("PARAMETRO_INVALIDO",
                            "El parámetro " + parametro.getClave() + " debe ser un número");
                }
            }
            case BOOLEANO -> {
                if (!"true".equalsIgnoreCase(valor.trim()) && !"false".equalsIgnoreCase(valor.trim())) {
                    throw new ReglaNegocioException("PARAMETRO_INVALIDO",
                            "El parámetro " + parametro.getClave() + " debe ser true o false");
                }
            }
            case TEXTO -> {
            }
        }
    }
}
