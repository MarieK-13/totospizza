package com.totospizza.mapper.catalogo;

import java.util.List;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import com.totospizza.dto.request.catalogo.EtiquetaRequest;
import com.totospizza.dto.response.catalogo.EtiquetaResponse;
import com.totospizza.mapper.MapperBaseConfig;
import com.totospizza.model.entity.catalogo.Etiqueta;

@Mapper(config = MapperBaseConfig.class)
public interface EtiquetaMapper {

    EtiquetaResponse toResponse(Etiqueta entidad);

    List<EtiquetaResponse> toResponses(List<Etiqueta> entidades);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    Etiqueta toEntity(EtiquetaRequest request);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    void updateEntity(EtiquetaRequest request, @MappingTarget Etiqueta entidad);
}
