package com.totospizza.mapper.operacion;

import java.util.List;

import org.mapstruct.Mapper;

import com.totospizza.dto.response.operacion.NotificacionResponse;
import com.totospizza.mapper.MapperBaseConfig;
import com.totospizza.model.entity.operacion.Notificacion;

@Mapper(config = MapperBaseConfig.class)
public interface NotificacionMapper {

    NotificacionResponse toResponse(Notificacion notificacion);

    List<NotificacionResponse> toResponses(List<Notificacion> notificaciones);
}
