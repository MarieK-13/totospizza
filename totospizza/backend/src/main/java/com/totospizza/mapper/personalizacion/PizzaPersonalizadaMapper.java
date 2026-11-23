package com.totospizza.mapper.personalizacion;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.totospizza.dto.response.personalizacion.IngredienteSeleccionadoResponse;
import com.totospizza.dto.response.personalizacion.PizzaPersonalizadaResponse;
import com.totospizza.mapper.MapperBaseConfig;
import com.totospizza.mapper.catalogo.TamanoPizzaMapper;
import com.totospizza.mapper.catalogo.TipoMasaMapper;
import com.totospizza.model.entity.personalizacion.PizzaPersonalizada;
import com.totospizza.model.entity.personalizacion.PizzaPersonalizadaIngrediente;

@Mapper(config = MapperBaseConfig.class, uses = {TamanoPizzaMapper.class, TipoMasaMapper.class})
public interface PizzaPersonalizadaMapper {

    PizzaPersonalizadaResponse toResponse(PizzaPersonalizada pizza);

    @Mapping(target = "ingredienteId", source = "ingrediente.id")
    @Mapping(target = "nombre", source = "ingrediente.nombre")
    IngredienteSeleccionadoResponse toSeleccionado(PizzaPersonalizadaIngrediente ingredientePizza);
}
