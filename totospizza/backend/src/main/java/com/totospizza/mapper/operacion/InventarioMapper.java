package com.totospizza.mapper.operacion;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.totospizza.dto.response.operacion.InventarioIngredienteResponse;
import com.totospizza.mapper.MapeoUtils;
import com.totospizza.mapper.MapperBaseConfig;
import com.totospizza.model.entity.operacion.InventarioIngrediente;

@Mapper(config = MapperBaseConfig.class, imports = MapeoUtils.class)
public interface InventarioMapper {

    @Mapping(target = "ingredienteId", source = "ingrediente.id")
    @Mapping(target = "ingredienteNombre", source = "ingrediente.nombre")
    @Mapping(target = "stockBajo", expression = "java(MapeoUtils.stockBajo(inventario))")
    InventarioIngredienteResponse toResponse(InventarioIngrediente inventario);

    List<InventarioIngredienteResponse> toResponses(List<InventarioIngrediente> inventarios);
}
