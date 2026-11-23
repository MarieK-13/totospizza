package com.totospizza.mapper.pedido;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.totospizza.dto.response.pedido.CarritoResponse;
import com.totospizza.dto.response.pedido.ItemCarritoResponse;
import com.totospizza.dto.response.pedido.ResumenMontosResponse;
import com.totospizza.mapper.MapeoUtils;
import com.totospizza.mapper.MapperBaseConfig;
import com.totospizza.model.entity.pedido.Carrito;
import com.totospizza.model.entity.pedido.ItemCarrito;

@Mapper(config = MapperBaseConfig.class, imports = MapeoUtils.class, uses = AdicionalMapper.class)
public interface CarritoMapper {

    @Mapping(target = "nombre", expression = "java(MapeoUtils.nombreItem(item))")
    @Mapping(target = "descripcion", expression = "java(MapeoUtils.descripcionItem(item))")
    @Mapping(target = "imagenUrl", expression = "java(MapeoUtils.imagenItem(item))")
    @Mapping(target = "tamano", source = "tamano.nombre")
    @Mapping(target = "tipoMasa", source = "tipoMasa.nombre")
    @Mapping(target = "subtotal", expression = "java(MapeoUtils.subtotalItem(item))")
    ItemCarritoResponse toItem(ItemCarrito item);

    @Mapping(target = "id", source = "carrito.id")
    @Mapping(target = "items", source = "carrito.items")
    @Mapping(target = "totalItems", expression = "java(MapeoUtils.totalItems(carrito))")
    @Mapping(target = "montos", source = "montos")
    @Mapping(target = "montosReferenciales", constant = "true")
    @Mapping(target = "avisoMontos", constant = "Montos referenciales: el total definitivo se calcula al confirmar el pedido, con el precio, el delivery y la cobertura vigentes.")
    CarritoResponse toResponse(Carrito carrito, ResumenMontosResponse montos);
}
