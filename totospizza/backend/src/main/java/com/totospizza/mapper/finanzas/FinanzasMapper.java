package com.totospizza.mapper.finanzas;

import java.util.List;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.totospizza.dto.request.finanzas.MovimientoFinancieroRequest;
import com.totospizza.dto.response.finanzas.MovimientoFinancieroResponse;
import com.totospizza.dto.response.finanzas.PagoMotorizadoResponse;
import com.totospizza.dto.response.finanzas.PedidosPorEstadoResponse;
import com.totospizza.dto.response.finanzas.ProductoVendidoResponse;
import com.totospizza.dto.response.finanzas.VentaDiariaResponse;
import com.totospizza.dto.response.finanzas.VentaPorMetodoPagoResponse;
import com.totospizza.mapper.MapeoUtils;
import com.totospizza.mapper.MapperBaseConfig;
import com.totospizza.model.entity.finanzas.MovimientoFinanciero;
import com.totospizza.model.entity.finanzas.PagoMotorizado;
import com.totospizza.repository.pago.projection.VentaPorMetodoPago;
import com.totospizza.repository.pedido.projection.PedidosPorEstado;
import com.totospizza.repository.pedido.projection.ProductoMasVendido;
import com.totospizza.repository.pedido.projection.VentaDiaria;


@Mapper(config = MapperBaseConfig.class, imports = MapeoUtils.class)
public interface FinanzasMapper {

    VentaDiariaResponse toVentaDiaria(VentaDiaria venta);

    List<VentaDiariaResponse> toVentasDiarias(List<VentaDiaria> ventas);

    ProductoVendidoResponse toProductoVendido(ProductoMasVendido producto);

    List<ProductoVendidoResponse> toProductosVendidos(List<ProductoMasVendido> productos);

    @Mapping(target = "transacciones", source = "cantidad")
    VentaPorMetodoPagoResponse toVentaPorMetodo(VentaPorMetodoPago venta);

    List<VentaPorMetodoPagoResponse> toVentasPorMetodo(List<VentaPorMetodoPago> ventas);

    PedidosPorEstadoResponse toPedidosPorEstado(PedidosPorEstado pedidos);

    List<PedidosPorEstadoResponse> toPedidosPorEstado(List<PedidosPorEstado> pedidos);

    @Mapping(target = "numeroPedido", source = "pedido.numero")
    MovimientoFinancieroResponse toMovimiento(MovimientoFinanciero movimiento);

    List<MovimientoFinancieroResponse> toMovimientos(List<MovimientoFinanciero> movimientos);

    @Mapping(target = "empleadoId", source = "empleado.id")
    @Mapping(target = "motorizadoNombre", expression = "java(MapeoUtils.nombreEmpleado(pago.getEmpleado()))")
    PagoMotorizadoResponse toPagoMotorizado(PagoMotorizado pago);

    List<PagoMotorizadoResponse> toPagosMotorizados(List<PagoMotorizado> pagos);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    MovimientoFinanciero toEntity(MovimientoFinancieroRequest request);
}
