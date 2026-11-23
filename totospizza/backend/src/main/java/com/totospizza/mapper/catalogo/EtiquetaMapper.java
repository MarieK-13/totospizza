package com.totospizza.mapper.catalogo;

import java.util.List;

import org.mapstruct.Mapper;

import com.totospizza.dto.response.catalogo.EtiquetaResponse;
import com.totospizza.mapper.MapperBaseConfig;
import com.totospizza.model.entity.catalogo.Etiqueta;

@Mapper(config = MapperBaseConfig.class)
public interface EtiquetaMapper {

    EtiquetaResponse toResponse(Etiqueta etiqueta);

    List<EtiquetaResponse> toResponses(List<Etiqueta> etiquetas);
}
