package com.totospizza.mapper.operacion;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.totospizza.dto.response.operacion.TurnoResponse;
import com.totospizza.mapper.MapeoUtils;
import com.totospizza.mapper.MapperBaseConfig;
import com.totospizza.model.entity.operacion.Turno;

@Mapper(config = MapperBaseConfig.class, imports = MapeoUtils.class)
public interface TurnoMapper {

    @Mapping(target = "empleadoId", source = "empleado.id")
    @Mapping(target = "empleadoNombre", expression = "java(MapeoUtils.nombreEmpleado(turno.getEmpleado()))")
    @Mapping(target = "horaInicio", source = "horario.horaInicio")
    @Mapping(target = "horaFin", source = "horario.horaFin")
    TurnoResponse toResponse(Turno turno);

    List<TurnoResponse> toResponses(List<Turno> turnos);
}
