package com.totospizza.mapper.catalogo;

import java.util.List;

import org.mapstruct.Mapper;

import com.totospizza.dto.response.catalogo.CategoriaResponse;
import com.totospizza.mapper.MapperBaseConfig;
import com.totospizza.model.entity.catalogo.Categoria;

@Mapper(config = MapperBaseConfig.class)
public interface CategoriaMapper {

    CategoriaResponse toResponse(Categoria categoria);

    List<CategoriaResponse> toResponses(List<Categoria> categorias);
}
