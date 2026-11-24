package com.totospizza.service.impl.pedido;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import com.totospizza.constant.ParametroClaves;
import com.totospizza.dto.request.pedido.ActualizarItemCarritoRequest;
import com.totospizza.dto.request.pedido.AdicionalRequest;
import com.totospizza.dto.request.pedido.AgregarProductoRequest;
import com.totospizza.dto.response.pedido.CarritoResponse;
import com.totospizza.dto.response.pedido.ResumenMontosResponse;
import com.totospizza.exception.RecursoNoEncontradoException;
import com.totospizza.exception.ReglaNegocioException;
import com.totospizza.mapper.pedido.CarritoMapper;
import com.totospizza.model.entity.AuditableEntity;
import com.totospizza.model.entity.catalogo.Ingrediente;
import com.totospizza.model.entity.catalogo.Producto;
import com.totospizza.model.entity.catalogo.ProductoTamano;
import com.totospizza.model.entity.catalogo.Promocion;
import com.totospizza.model.entity.catalogo.TipoMasa;
import com.totospizza.model.entity.pedido.Carrito;
import com.totospizza.model.entity.pedido.ItemCarrito;
import com.totospizza.model.entity.pedido.ItemCarritoAdicional;
import com.totospizza.model.entity.personalizacion.PizzaPersonalizada;
import com.totospizza.model.enums.EstadoCarrito;
import com.totospizza.model.enums.TipoEntrega;
import com.totospizza.repository.catalogo.IngredienteRepository;
import com.totospizza.repository.catalogo.ProductoRepository;
import com.totospizza.repository.catalogo.ProductoTamanoRepository;
import com.totospizza.repository.catalogo.PromocionRepository;
import com.totospizza.repository.catalogo.TipoMasaRepository;
import com.totospizza.repository.pedido.CarritoRepository;
import com.totospizza.repository.personalizacion.PizzaPersonalizadaRepository;
import com.totospizza.repository.seguridad.UsuarioRepository;
import com.totospizza.rules.calculator.CalculadoraCarrito;
import com.totospizza.rules.calculator.CalculadoraMontos;
import com.totospizza.service.configuracion.ParametrosService;
import com.totospizza.service.pedido.CarritoService;

@Service
@RequiredArgsConstructor
@Transactional
public class CarritoServiceImpl implements CarritoService {

    private final CarritoRepository carritoRepository;
    private final ProductoRepository productoRepository;
    private final ProductoTamanoRepository productoTamanoRepository;
    private final TipoMasaRepository tipoMasaRepository;
    private final IngredienteRepository ingredienteRepository;
    private final PromocionRepository promocionRepository;
    private final PizzaPersonalizadaRepository pizzaRepository;
    private final UsuarioRepository usuarioRepository;
    private final CarritoMapper carritoMapper;
    private final ParametrosService parametros;
    private final Clock clock;

    @Override
    @Transactional(readOnly = true)
    public CarritoResponse obtener(Long usuarioId) {
        return respuesta(carritoRepository.findByUsuarioIdAndEstado(usuarioId, EstadoCarrito.ACTIVO)
                .orElseGet(Carrito::new));
    }

    @Override
    public CarritoResponse agregar(Long usuarioId, AgregarProductoRequest request) {
        Carrito carrito = carritoActivo(usuarioId);
        ItemCarrito nuevo = construirItem(usuarioId, request);
        carrito.getItems().stream()
                .filter(existente -> mismaLinea(existente, nuevo))
                .findFirst()
                .ifPresentOrElse(
                        existente -> existente.setCantidad(existente.getCantidad() + nuevo.getCantidad()),
                        () -> {
                            nuevo.setCarrito(carrito);
                            carrito.getItems().add(nuevo);
                        });
        tocar(carrito);
        return respuesta(carrito);
    }

    @Override
    public CarritoResponse actualizarItem(Long usuarioId, Long itemId, ActualizarItemCarritoRequest request) {
        Carrito carrito = carritoActivo(usuarioId);
        ItemCarrito item = carrito.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto del carrito", itemId));
        item.setCantidad(request.cantidad());
        item.setNotas(textoOnulo(request.notas()));
        tocar(carrito);
        return respuesta(carrito);
    }

    @Override
    public CarritoResponse quitarItem(Long usuarioId, Long itemId) {
        Carrito carrito = carritoActivo(usuarioId);
        if (!carrito.getItems().removeIf(i -> i.getId().equals(itemId))) {
            throw new RecursoNoEncontradoException("Producto del carrito", itemId);
        }
        tocar(carrito);
        return respuesta(carrito);
    }

    @Override
    public CarritoResponse vaciar(Long usuarioId) {
        Carrito carrito = carritoActivo(usuarioId);
        carrito.getItems().clear();
        tocar(carrito);
        return respuesta(carrito);
    }

    private ItemCarrito construirItem(Long usuarioId, AgregarProductoRequest request) {
        int origenes = (request.productoId() != null ? 1 : 0)
                + (request.pizzaPersonalizadaId() != null ? 1 : 0)
                + (request.promocionId() != null ? 1 : 0);
        if (origenes != 1) {
            throw new ReglaNegocioException("ITEM_INVALIDO",
                    "Indica un producto, una pizza personalizada o una promoción");
        }
        ItemCarrito item = new ItemCarrito();
        item.setCantidad(request.cantidad());
        item.setNotas(textoOnulo(request.notas()));

        if (request.productoId() != null) {
            configurarProducto(item, request);
        } else {
            exigirSinOpciones(request);
            if (request.pizzaPersonalizadaId() != null) {
                configurarPizza(item, usuarioId, request.pizzaPersonalizadaId());
            } else {
                configurarPromocion(item, request.promocionId());
            }
        }
        return item;
    }

    private void configurarProducto(ItemCarrito item, AgregarProductoRequest request) {
        Producto producto = productoRepository.findById(request.productoId())
                .filter(Producto::isDisponible)
                .orElseThrow(() -> new ReglaNegocioException("PRODUCTO_NO_DISPONIBLE", "El producto ya no está disponible"));
        item.setProducto(producto);

        if (!producto.isRequiereTamano()) {
            exigirSinOpciones(request);
            item.setPrecioUnitario(producto.getPrecioBase());
            return;
        }
        if (request.tamanoId() == null || request.tipoMasaId() == null) {
            throw new ReglaNegocioException("OPCIONES_REQUERIDAS", "Elige el tamaño y la masa de la pizza");
        }
        ProductoTamano precio = productoTamanoRepository
                .findByProductoIdAndTamanoId(producto.getId(), request.tamanoId())
                .orElseThrow(() -> new ReglaNegocioException("TAMANO_NO_DISPONIBLE", "Ese tamaño no está disponible"));
        TipoMasa masa = tipoMasaRepository.findById(request.tipoMasaId())
                .filter(TipoMasa::isActiva)
                .orElseThrow(() -> new ReglaNegocioException("MASA_NO_DISPONIBLE", "Esa masa no está disponible"));
        item.setTamano(precio.getTamano());
        item.setTipoMasa(masa);
        item.setPrecioUnitario(precio.getPrecio().add(masa.getRecargo()));
        agregarAdicionales(item, request.adicionales());
    }

    private void configurarPizza(ItemCarrito item, Long usuarioId, Long pizzaId) {
        PizzaPersonalizada pizza = pizzaRepository.findConDetalleById(pizzaId)
                .filter(p -> p.getUsuario().getId().equals(usuarioId))
                .orElseThrow(() -> new RecursoNoEncontradoException("Pizza personalizada", pizzaId));
        item.setPizzaPersonalizada(pizza);
        item.setTamano(pizza.getTamano());
        item.setTipoMasa(pizza.getTipoMasa());
        item.setPrecioUnitario(pizza.getPrecioTotal());
    }

    private void configurarPromocion(ItemCarrito item, Long promocionId) {
        Instant ahora = Instant.now(clock);
        Promocion promocion = promocionRepository.findById(promocionId)
                .filter(p -> p.isActiva() && !ahora.isBefore(p.getVigenteDesde()) && ahora.isBefore(p.getVigenteHasta()))
                .orElseThrow(() -> new ReglaNegocioException("PROMOCION_NO_VIGENTE", "La promoción ya no está vigente"));
        item.setPromocion(promocion);
        item.setPrecioUnitario(promocion.getPrecioPromocional());
    }

    private void agregarAdicionales(ItemCarrito item, List<AdicionalRequest> pedidos) {
        if (pedidos == null || pedidos.isEmpty()) {
            return;
        }
        Map<Long, Integer> cantidades = pedidos.stream()
                .collect(Collectors.toMap(AdicionalRequest::ingredienteId, AdicionalRequest::cantidad, Integer::sum));
        Map<Long, Ingrediente> ingredientes = ingredienteRepository.findByIdInAndDisponibleTrue(cantidades.keySet()).stream()
                .collect(Collectors.toMap(Ingrediente::getId, Function.identity()));
        if (ingredientes.size() != cantidades.size()) {
            throw new ReglaNegocioException("ADICIONAL_NO_DISPONIBLE", "Uno de los adicionales ya no está disponible");
        }
        cantidades.forEach((id, cantidad) -> {
            Ingrediente ingrediente = ingredientes.get(id);
            ItemCarritoAdicional adicional = new ItemCarritoAdicional();
            adicional.setItem(item);
            adicional.setIngrediente(ingrediente);
            adicional.setCantidad(cantidad);
            adicional.setPrecioUnitario(ingrediente.getPrecioExtra());
            item.getAdicionales().add(adicional);
        });
    }

    private static void exigirSinOpciones(AgregarProductoRequest request) {
        boolean conOpciones = request.tamanoId() != null || request.tipoMasaId() != null
                || (request.adicionales() != null && !request.adicionales().isEmpty());
        if (conOpciones) {
            throw new ReglaNegocioException("OPCIONES_NO_APLICAN", "Este producto no admite tamaño, masa ni adicionales");
        }
    }

    private Carrito carritoActivo(Long usuarioId) {
        return carritoRepository.findByUsuarioIdAndEstado(usuarioId, EstadoCarrito.ACTIVO).orElseGet(() -> {
            Carrito carrito = new Carrito();
            carrito.setUsuario(usuarioRepository.getReferenceById(usuarioId));
            carrito.setEstado(EstadoCarrito.ACTIVO);
            return carritoRepository.save(carrito);
        });
    }

    private void tocar(Carrito carrito) {
        carrito.setActualizadoEn(Instant.now(clock));
    }

    private CarritoResponse respuesta(Carrito carrito) {
        BigDecimal subtotal = CalculadoraCarrito.subtotal(carrito.getItems());
        TipoEntrega tipo = carrito.getItems().isEmpty() ? TipoEntrega.RECOJO : TipoEntrega.DELIVERY;
        ResumenMontosResponse montos = CalculadoraMontos.calcular(subtotal, tipo, null,
                parametros.numero(ParametroClaves.COSTO_DELIVERY_BASE, ParametroClaves.COSTO_DELIVERY_BASE_DEFECTO),
                parametros.numero(ParametroClaves.ENVIO_GRATIS_DESDE, ParametroClaves.ENVIO_GRATIS_DESDE_DEFECTO),
                BigDecimal.ZERO);
        return carritoMapper.toResponse(carrito, montos);
    }

    private static boolean mismaLinea(ItemCarrito a, ItemCarrito b) {
        return a.getAdicionales().isEmpty() && b.getAdicionales().isEmpty()
                && Objects.equals(id(a.getProducto()), id(b.getProducto()))
                && Objects.equals(id(a.getPizzaPersonalizada()), id(b.getPizzaPersonalizada()))
                && Objects.equals(id(a.getPromocion()), id(b.getPromocion()))
                && Objects.equals(id(a.getTamano()), id(b.getTamano()))
                && Objects.equals(id(a.getTipoMasa()), id(b.getTipoMasa()))
                && Objects.equals(a.getNotas(), b.getNotas());
    }

    private static Long id(AuditableEntity entidad) {
        return entidad == null ? null : entidad.getId();
    }

    private static String textoOnulo(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
    }
}
