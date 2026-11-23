package com.totospizza.mapper.operacion;

import java.time.Instant;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.totospizza.dto.response.operacion.ItemCocinaResponse;
import com.totospizza.dto.response.operacion.PedidoListoResponse;
import com.totospizza.dto.response.operacion.TicketCocinaResponse;
import com.totospizza.mapper.MapeoUtils;
import com.totospizza.mapper.MapperBaseConfig;
import com.totospizza.model.entity.operacion.Entrega;
import com.totospizza.model.entity.pedido.DetallePedido;
import com.totospizza.model.entity.pedido.DetallePedidoAdicional;
import com.totospizza.model.entity.pedido.Pedido;


@Mapper(config = MapperBaseConfig.class, imports = MapeoUtils.class)
public interface CocinaMapper {

    ItemCocinaResponse toItem(DetallePedido detalle);

    @Mapping(target = ".", source = "pedido")
    @Mapping(target = "pedidoId", source = "pedido.id")
    @Mapping(target = "minutosTranscurridos",
            expression = "java(MapeoUtils.minutosTranscurridos(pedido.getConfirmadoEn(), ahora))")
    @Mapping(target = "items", source = "pedido.detalles")
    TicketCocinaResponse toTicket(Pedido pedido, Instant ahora);

    @Mapping(target = "pedidoId", source = "pedido.id")
    @Mapping(target = "numero", source = "pedido.numero")
    @Mapping(target = "tipoEntrega", source = "pedido.tipoEntrega")
    @Mapping(target = "nombreCliente", expression = "java(MapeoUtils.nombreCompleto(pedido.getCliente()))")
    @Mapping(target = "cantidadItems", expression = "java(MapeoUtils.cantidadItems(pedido))")
    @Mapping(target = "listoEn", source = "pedido.listoEn")
    @Mapping(target = "estadoEntrega", source = "entrega.estado")
    @Mapping(target = "motorizadoNombre", expression = "java(MapeoUtils.nombreMotorizado(entrega))")
    @Mapping(target = "vencimientoRecojo", source = "pedido.vencimientoRecojo")
    PedidoListoResponse toListo(Pedido pedido, Entrega entrega);

    default String adicionalTexto(DetallePedidoAdicional adicional) {
        return adicional.getCantidad() + " x " + adicional.getNombre();
    }
}
