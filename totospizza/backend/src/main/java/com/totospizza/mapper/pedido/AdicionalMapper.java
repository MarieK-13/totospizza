package com.totospizza.mapper.pedido;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.totospizza.dto.response.pedido.AdicionalResponse;
import com.totospizza.mapper.MapperBaseConfig;
import com.totospizza.model.entity.pedido.DetallePedidoAdicional;
import com.totospizza.model.entity.pedido.ItemCarritoAdicional;

@Mapper(config = MapperBaseConfig.class)
public interface AdicionalMapper {

    @Mapping(target = "ingredienteId", source = "ingrediente.id")
    @Mapping(target = "nombre", source = "ingrediente.nombre")
    AdicionalResponse toResponse(ItemCarritoAdicional adicional);

    @Mapping(target = "ingredienteId", source = "ingrediente.id")
    AdicionalResponse toResponse(DetallePedidoAdicional adicional);
}
