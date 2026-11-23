package com.totospizza.mapper.operacion;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.totospizza.dto.response.operacion.EntregaAsignadaResponse;
import com.totospizza.dto.response.operacion.EntregaResponse;
import com.totospizza.mapper.MapeoUtils;
import com.totospizza.mapper.MapperBaseConfig;
import com.totospizza.mapper.seguridad.DireccionMapper;
import com.totospizza.model.entity.operacion.Entrega;


@Mapper(config = MapperBaseConfig.class, imports = MapeoUtils.class, uses = DireccionMapper.class)
public interface EntregaMapper {

    @Mapping(target = "pedidoId", source = "pedido.id")
    @Mapping(target = "numeroPedido", source = "pedido.numero")
    @Mapping(target = "motorizadoNombre", expression = "java(MapeoUtils.nombreMotorizado(entrega))")
    EntregaResponse toResponse(Entrega entrega);

    @Mapping(target = "entregaId", source = "id")
    @Mapping(target = "pedidoId", source = "pedido.id")
    @Mapping(target = "numeroPedido", source = "pedido.numero")
    @Mapping(target = "nombreCliente", expression = "java(MapeoUtils.nombreCompleto(entrega.getPedido().getCliente()))")
    @Mapping(target = "telefonoCliente", source = "pedido.cliente.telefono")
    @Mapping(target = "direccion", source = "pedido.direccionEntrega")
    @Mapping(target = "instrucciones", source = "pedido.instrucciones")
    EntregaAsignadaResponse toAsignada(Entrega entrega);
}
