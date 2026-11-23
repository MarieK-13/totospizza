package com.totospizza.mapper.resena;

import java.util.List;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.totospizza.dto.request.resena.ResenaRequest;
import com.totospizza.dto.response.resena.CalificacionProductoResponse;
import com.totospizza.dto.response.resena.ResenaResponse;
import com.totospizza.dto.response.resena.ResumenCalificacionResponse;
import com.totospizza.mapper.MapeoUtils;
import com.totospizza.mapper.MapperBaseConfig;
import com.totospizza.model.entity.resena.CalificacionProducto;
import com.totospizza.model.entity.resena.Resena;
import com.totospizza.repository.resena.projection.ResumenCalificacion;

@Mapper(config = MapperBaseConfig.class, imports = MapeoUtils.class)
public interface ResenaMapper {

    @Mapping(target = "autor", expression = "java(MapeoUtils.autor(resena.getUsuario()))")
    ResenaResponse toResponse(Resena resena);

    List<ResenaResponse> toResponses(List<Resena> resenas);

    @Mapping(target = "productoId", source = "producto.id")
    @Mapping(target = "productoNombre", source = "producto.nombre")
    CalificacionProductoResponse toCalificacion(CalificacionProducto calificacion);

    @Mapping(target = "promedio", expression = "java(MapeoUtils.promedio(resumen.getPromedio()))")
    ResumenCalificacionResponse toResumen(ResumenCalificacion resumen);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    @Mapping(target = "calificaciones", ignore = true)
    Resena toEntity(ResenaRequest request);
}
