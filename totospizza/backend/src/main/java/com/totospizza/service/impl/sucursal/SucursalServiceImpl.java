package com.totospizza.service.impl.sucursal;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import com.totospizza.constant.ParametroClaves;
import com.totospizza.dto.request.catalogo.CambiarDisponibilidadRequest;
import com.totospizza.dto.request.sucursal.ConsultaCoberturaRequest;
import com.totospizza.dto.request.sucursal.HorarioSucursalRequest;
import com.totospizza.dto.request.sucursal.SucursalRequest;
import com.totospizza.dto.request.sucursal.ZonaRepartoRequest;
import com.totospizza.dto.response.sucursal.CoberturaResponse;
import com.totospizza.dto.response.sucursal.LocalesResponse;
import com.totospizza.dto.response.sucursal.SucursalResponse;
import com.totospizza.exception.RecursoNoEncontradoException;
import com.totospizza.exception.ReglaNegocioException;
import com.totospizza.mapper.sucursal.SucursalMapper;
import com.totospizza.model.entity.sucursal.HorarioSucursal;
import com.totospizza.model.entity.sucursal.Sucursal;
import com.totospizza.model.entity.sucursal.ZonaReparto;
import com.totospizza.model.enums.Rol;
import com.totospizza.repository.seguridad.EmpleadoRepository;
import com.totospizza.repository.sucursal.SucursalRepository;
import com.totospizza.repository.sucursal.ZonaRepartoRepository;
import com.totospizza.rules.calculator.CalculadoraDistancia;
import com.totospizza.rules.policy.HorarioPolicy;
import com.totospizza.service.configuracion.ParametrosService;
import com.totospizza.service.operacion.InventarioService;
import com.totospizza.service.sucursal.SucursalService;

@Service
@RequiredArgsConstructor
@Transactional
public class SucursalServiceImpl implements SucursalService {

    private static final List<Rol> ROLES_OPERATIVOS = List.of(Rol.PIZZERO, Rol.DESPACHADOR, Rol.MOTORIZADO);

    private final SucursalRepository sucursalRepository;
    private final ZonaRepartoRepository zonaRepository;
    private final EmpleadoRepository empleadoRepository;
    private final SucursalMapper sucursalMapper;
    private final ParametrosService parametros;
    private final InventarioService inventarioService;
    private final Clock clock;

    @Override
    @Transactional(readOnly = true)
    public LocalesResponse locales() {
        return new LocalesResponse(sucursalRepository.findByActivaTrueOrderByNombreAsc().stream()
                .map(this::respuesta)
                .toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SucursalResponse obtener(Long id) {
        return respuesta(sucursal(id));
    }

    @Override
    @Transactional(readOnly = true)
    public CoberturaResponse consultarCobertura(ConsultaCoberturaRequest request) {
        Sucursal sucursal = request.sucursalId() == null
                ? masCercana(request)
                : sucursalActiva(request.sucursalId());
        BigDecimal distancia = distancia(sucursal, request);

        if (distancia.compareTo(sucursal.getRadioCoberturaKm()) > 0) {
            return new CoberturaResponse(false, distancia, sucursal.getId(), sucursal.getNombre(), null, null,
                    "Tu dirección está fuera de la zona de reparto (hasta " + sucursal.getRadioCoberturaKm() + " km)");
        }
        BigDecimal costo = zonaRepository.findPorDistancia(sucursal.getId(), distancia)
                .map(ZonaReparto::getCostoEnvio)
                .orElseGet(() -> parametros.numero(ParametroClaves.COSTO_DELIVERY_BASE,
                        ParametroClaves.COSTO_DELIVERY_BASE_DEFECTO));
        return new CoberturaResponse(true, distancia, sucursal.getId(), sucursal.getNombre(), costo,
                minutosEstimados(distancia), "Llegamos a tu dirección");
    }

    @Override
    @Transactional(readOnly = true)
    public List<SucursalResponse> listar() {
        return sucursalRepository.findAll().stream()
                .sorted(Comparator.comparing(Sucursal::getNombre))
                .map(this::respuesta)
                .toList();
    }

    @Override
    public SucursalResponse crear(SucursalRequest request) {
        validarNombreLibre(request.nombre(), null);
        Sucursal sucursal = sucursalMapper.toEntity(request);
        sincronizarHorarios(sucursal, request.horarios());
        sincronizarZonas(sucursal, request.zonas());
        exigirHorarioSiEstaActiva(sucursal);
        Sucursal guardada = sucursalRepository.save(sucursal);
        inventarioService.inicializarStockWeb(guardada);
        return respuesta(guardada);
    }

    @Override
    public SucursalResponse actualizar(Long id, SucursalRequest request) {
        Sucursal sucursal = sucursal(id);
        validarNombreLibre(request.nombre(), id);
        sucursalMapper.updateEntity(request, sucursal);
        sincronizarHorarios(sucursal, request.horarios());
        sincronizarZonas(sucursal, request.zonas());
        exigirHorarioSiEstaActiva(sucursal);
        return respuesta(sucursal);
    }

    @Override
    public SucursalResponse cambiarActiva(Long id, CambiarDisponibilidadRequest request) {
        Sucursal sucursal = sucursal(id);
        sucursal.setActiva(request.disponible());
        exigirHorarioSiEstaActiva(sucursal);
        return respuesta(sucursal);
    }

    /** Una sucursal activa sin ningún día abierto nunca vendería: se avisa al configurarla, no al cliente. */
    private static void exigirHorarioSiEstaActiva(Sucursal sucursal) {
        if (sucursal.isActiva() && !HorarioPolicy.tieneHorarioUtil(sucursal)) {
            throw new ReglaNegocioException("HORARIO_REQUERIDO",
                    "Una sucursal activa necesita al menos un día abierto con hora de apertura y de cierre");
        }
    }

    private int minutosEstimados(BigDecimal distanciaKm) {
        int preparacion = parametros.entero(ParametroClaves.MINUTOS_PREPARACION, ParametroClaves.MINUTOS_PREPARACION_DEFECTO);
        int porKm = parametros.entero(ParametroClaves.MINUTOS_POR_KM, ParametroClaves.MINUTOS_POR_KM_DEFECTO);
        return preparacion + distanciaKm.multiply(BigDecimal.valueOf(porKm)).setScale(0, RoundingMode.CEILING).intValue();
    }

    private SucursalResponse respuesta(Sucursal sucursal) {
        return sucursalMapper.toResponse(sucursal, HorarioPolicy.abierta(sucursal, LocalDateTime.now(clock)),
                personalFaltante(sucursal));
    }

    private BigDecimal distancia(Sucursal sucursal, ConsultaCoberturaRequest destino) {
        return CalculadoraDistancia.kilometros(sucursal.getDireccion().getLatitud(), sucursal.getDireccion().getLongitud(),
                destino.latitud(), destino.longitud());
    }

    /**
     * Elige la sucursal que atenderá un delivery: la más cercana que cubra la dirección, esté abierta y tenga
     * pizzero, despachador y motorizado. Si ninguna puede, devuelve la más cercana para que el mensaje de cobertura
     * sea el correcto.
     */
    private Sucursal masCercana(ConsultaCoberturaRequest destino) {
        List<Sucursal> porCercania = sucursalRepository.findByActivaTrueOrderByNombreAsc().stream()
                .sorted(Comparator.comparing(s -> distancia(s, destino)))
                .toList();
        if (porCercania.isEmpty()) {
            throw new ReglaNegocioException("SIN_SUCURSALES", "No hay sucursales disponibles por ahora");
        }
        LocalDateTime ahora = LocalDateTime.now(clock);
        return porCercania.stream()
                .filter(s -> distancia(s, destino).compareTo(s.getRadioCoberturaKm()) <= 0)
                .filter(s -> HorarioPolicy.abierta(s, ahora))
                .filter(this::tienePersonalOperativo)
                .findFirst()
                .orElse(porCercania.get(0));
    }

    private boolean tienePersonalOperativo(Sucursal sucursal) {
        return personalFaltante(sucursal).isEmpty();
    }

    /** Un delivery necesita cocina, mostrador y reparto: si falta alguno, la sede no recibe pedidos a domicilio. */
    private List<Rol> personalFaltante(Sucursal sucursal) {
        if (sucursal.getId() == null) {
            return ROLES_OPERATIVOS;
        }
        return ROLES_OPERATIVOS.stream()
                .filter(rol -> !empleadoRepository.existsBySucursalIdAndUsuarioRolAndUsuarioActivoTrue(sucursal.getId(), rol))
                .toList();
    }

    private void validarNombreLibre(String nombre, Long idActual) {
        sucursalRepository.findByNombre(nombre)
                .filter(existente -> !existente.getId().equals(idActual))
                .ifPresent(existente -> {
                    throw new ReglaNegocioException("SUCURSAL_DUPLICADA", "Ya existe una sucursal con ese nombre");
                });
    }

    private void sincronizarHorarios(Sucursal sucursal, List<HorarioSucursalRequest> pedidos) {
        Map<DayOfWeek, HorarioSucursalRequest> porDia = pedidos.stream()
                .collect(Collectors.toMap(HorarioSucursalRequest::diaSemana, Function.identity(), (a, b) -> {
                    throw new ReglaNegocioException("HORARIO_REPETIDO", "Un día no puede tener dos horarios");
                }));
        Map<DayOfWeek, HorarioSucursal> actuales = sucursal.getHorarios().stream()
                .collect(Collectors.toMap(HorarioSucursal::getDiaSemana, Function.identity()));

        sucursal.getHorarios().removeIf(h -> !porDia.containsKey(h.getDiaSemana()));
        porDia.forEach((dia, pedido) -> {
            HorarioSucursal nuevo = sucursalMapper.toEntity(pedido);
            HorarioSucursal horario = actuales.get(dia);
            if (horario == null) {
                nuevo.setSucursal(sucursal);
                sucursal.getHorarios().add(nuevo);
            } else {
                horario.setHorario(nuevo.getHorario());
                horario.setCerrado(nuevo.isCerrado());
            }
        });
    }

    /** Las zonas se identifican por nombre dentro de la sucursal. */
    private void sincronizarZonas(Sucursal sucursal, List<ZonaRepartoRequest> pedidos) {
        Map<String, ZonaRepartoRequest> porNombre = pedidos.stream()
                .collect(Collectors.toMap(ZonaRepartoRequest::nombre, Function.identity(), (a, b) -> {
                    throw new ReglaNegocioException("ZONA_REPETIDA", "Hay dos zonas con el mismo nombre");
                }));
        pedidos.forEach(SucursalServiceImpl::validarRangoZona);
        Map<String, ZonaReparto> actuales = sucursal.getZonas().stream()
                .collect(Collectors.toMap(ZonaReparto::getNombre, Function.identity()));

        sucursal.getZonas().removeIf(z -> !porNombre.containsKey(z.getNombre()));
        porNombre.forEach((nombre, pedido) -> {
            ZonaReparto nueva = sucursalMapper.toEntity(pedido);
            ZonaReparto zona = actuales.get(nombre);
            if (zona == null) {
                nueva.setSucursal(sucursal);
                sucursal.getZonas().add(nueva);
            } else {
                zona.setDistanciaDesdeKm(nueva.getDistanciaDesdeKm());
                zona.setDistanciaHastaKm(nueva.getDistanciaHastaKm());
                zona.setCostoEnvio(nueva.getCostoEnvio());
                zona.setActiva(nueva.isActiva());
            }
        });
    }

    private static void validarRangoZona(ZonaRepartoRequest zona) {
        if (zona.distanciaHastaKm().compareTo(zona.distanciaDesdeKm()) <= 0) {
            throw new ReglaNegocioException("ZONA_INVALIDA",
                    "En la zona \"" + zona.nombre() + "\" la distancia final debe ser mayor que la inicial");
        }
    }

    private Sucursal sucursal(Long id) {
        return sucursalRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Sucursal", id));
    }

    private Sucursal sucursalActiva(Long id) {
        Sucursal sucursal = sucursal(id);
        if (!sucursal.isActiva()) {
            throw new ReglaNegocioException("SUCURSAL_INACTIVA", "La sucursal elegida no está disponible");
        }
        return sucursal;
    }
}
