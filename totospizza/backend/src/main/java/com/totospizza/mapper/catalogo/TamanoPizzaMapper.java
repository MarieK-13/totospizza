package com.totospizza.mapper.catalogo;

import java.util.List;

import org.mapstruct.Mapper;

import com.totospizza.dto.response.catalogo.TamanoPizzaResponse;
import com.totospizza.mapper.MapperBaseConfig;
import com.totospizza.model.entity.catalogo.TamanoPizza;

@Mapper(config = MapperBaseConfig.class)
public interface TamanoPizzaMapper {

    TamanoPizzaResponse toResponse(TamanoPizza tamano);

    List<TamanoPizzaResponse> toResponses(List<TamanoPizza> tamanos);
}
