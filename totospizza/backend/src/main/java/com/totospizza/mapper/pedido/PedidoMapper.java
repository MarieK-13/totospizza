package com.totospizza.mapper.pedido;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.totospizza.dto.response.pago.PagoResponse;
import com.totospizza.dto.response.pedido.DetallePedidoResponse;
import com.totospizza.dto.response.pedido.HistorialEstadoResponse;
import com.totospizza.dto.response.pedido.PedidoResponse;
import com.totospizza.dto.response.pedido.PedidoResumenResponse;
import com.totospizza.mapper.MapeoUtils;
import com.totospizza.mapper.MapperBaseConfig;
import com.totospizza.mapper.seguridad.DireccionMapper;
import com.totospizza.model.entity.pedido.DetallePedido;
import com.totospizza.model.entity.pedido.Pedido;
import com.totospizza.model.entity.pedido.PedidoEstadoHistorial;

@Mapper(config = MapperBaseConfig.class, imports = MapeoUtils.class, uses = {AdicionalMapper.class, DireccionMapper.class})
public interface PedidoMapper {

    @Mapping(target = "productoId", source = "producto.id")
    DetallePedidoResponse toDetalle(DetallePedido detalle);

    @Mapping(target = "fecha", source = "creadoEn")
    HistorialEstadoResponse toHistorial(PedidoEstadoHistorial historial);

    @Mapping(target = "cantidadItems", expression = "java(MapeoUtils.cantidadItems(pedido))")
    @Mapping(target = "nombreCliente", expression = "java(MapeoUtils.nombreCompleto(pedido.getCliente()))")
    @Mapping(target = "telefonoCliente", source = "cliente.telefono")
    PedidoResumenResponse toResumen(Pedido pedido);

    List<PedidoResumenResponse> toResumenes(List<Pedido> pedidos);

    @Mapping(target = "id", source = "pedido.id")
    @Mapping(target = "numero", source = "pedido.numero")
    @Mapping(target = "tipoEntrega", source = "pedido.tipoEntrega")
    @Mapping(target = "estado", source = "pedido.estado")
    @Mapping(target = "direccionEntrega", source = "pedido.direccionEntrega")
    @Mapping(target = "instrucciones", source = "pedido.instrucciones")
    @Mapping(target = "detalles", source = "pedido.detalles")
    @Mapping(target = "minutosEstimados", source = "pedido.minutosEstimados")
    @Mapping(target = "creadoEn", source = "pedido.creadoEn")
    @Mapping(target = "confirmadoEn", source = "pedido.confirmadoEn")
    @Mapping(target = "entregadoEn", source = "pedido.entregadoEn")
    @Mapping(target = "vencimientoRecojo", source = "pedido.vencimientoRecojo")
    @Mapping(target = "garantiaAplicada", source = "pedido.garantiaAplicada")
    @Mapping(target = "sucursalNombre", source = "pedido.sucursal.nombre")
    @Mapping(target = "montos", expression = "java(MapeoUtils.montos(pedido))")
    @Mapping(target = "pago", source = "pago")
    @Mapping(target = "historial", source = "historial")
    @Mapping(target = "resenado", source = "resenado")
    PedidoResponse toResponse(Pedido pedido, PagoResponse pago, List<PedidoEstadoHistorial> historial, boolean resenado);
}
