package com.totospizza.mapper.catalogo;

import java.util.List;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import com.totospizza.dto.request.catalogo.TamanoPizzaRequest;
import com.totospizza.dto.response.catalogo.TamanoPizzaResponse;
import com.totospizza.mapper.MapperBaseConfig;
import com.totospizza.model.entity.catalogo.TamanoPizza;

@Mapper(config = MapperBaseConfig.class)
public interface TamanoPizzaMapper {

    TamanoPizzaResponse toResponse(TamanoPizza entidad);

    List<TamanoPizzaResponse> toResponses(List<TamanoPizza> entidades);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    @Mapping(target = "orden", source = "orden", defaultValue = "0")
    TamanoPizza toEntity(TamanoPizzaRequest request);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    @Mapping(target = "orden", source = "orden", defaultValue = "0")
    void updateEntity(TamanoPizzaRequest request, @MappingTarget TamanoPizza entidad);
}
