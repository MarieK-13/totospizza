package com.totospizza.mapper.catalogo;

import java.util.List;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import com.totospizza.dto.request.catalogo.CategoriaRequest;
import com.totospizza.dto.response.catalogo.CategoriaResponse;
import com.totospizza.mapper.MapperBaseConfig;
import com.totospizza.model.entity.catalogo.Categoria;

@Mapper(config = MapperBaseConfig.class)
public interface CategoriaMapper {

    CategoriaResponse toResponse(Categoria entidad);

    List<CategoriaResponse> toResponses(List<Categoria> entidades);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    @Mapping(target = "orden", source = "orden", defaultValue = "0")
    Categoria toEntity(CategoriaRequest request);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    @Mapping(target = "orden", source = "orden", defaultValue = "0")
    void updateEntity(CategoriaRequest request, @MappingTarget Categoria entidad);
}
