package com.totospizza.mapper.catalogo;

import java.util.List;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import com.totospizza.dto.request.catalogo.IngredienteRequest;
import com.totospizza.dto.response.catalogo.IngredienteResponse;
import com.totospizza.mapper.MapperBaseConfig;
import com.totospizza.model.entity.catalogo.Ingrediente;

@Mapper(config = MapperBaseConfig.class)
public interface IngredienteMapper {

    IngredienteResponse toResponse(Ingrediente ingrediente);

    List<IngredienteResponse> toResponses(List<Ingrediente> ingredientes);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    Ingrediente toEntity(IngredienteRequest request);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    void updateEntity(IngredienteRequest request, @MappingTarget Ingrediente ingrediente);
}
