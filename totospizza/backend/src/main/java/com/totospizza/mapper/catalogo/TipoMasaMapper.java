package com.totospizza.mapper.catalogo;

import java.util.List;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import com.totospizza.dto.request.catalogo.TipoMasaRequest;
import com.totospizza.dto.response.catalogo.TipoMasaResponse;
import com.totospizza.mapper.MapperBaseConfig;
import com.totospizza.model.entity.catalogo.TipoMasa;

@Mapper(config = MapperBaseConfig.class)
public interface TipoMasaMapper {

    TipoMasaResponse toResponse(TipoMasa tipoMasa);

    List<TipoMasaResponse> toResponses(List<TipoMasa> tiposMasa);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    TipoMasa toEntity(TipoMasaRequest request);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    void updateEntity(TipoMasaRequest request, @MappingTarget TipoMasa tipoMasa);
}
