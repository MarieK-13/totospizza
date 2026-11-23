package com.totospizza.mapper.seguridad;

import java.util.List;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import com.totospizza.dto.request.seguridad.EmpleadoRequest;
import com.totospizza.dto.response.seguridad.EmpleadoResponse;
import com.totospizza.mapper.MapeoUtils;
import com.totospizza.mapper.MapperBaseConfig;
import com.totospizza.model.entity.seguridad.Empleado;
import com.totospizza.model.entity.seguridad.Usuario;


@Mapper(config = MapperBaseConfig.class, imports = MapeoUtils.class)
public interface EmpleadoMapper {

    @Mapping(target = "usuarioId", source = "usuario.id")
    @Mapping(target = "nombreCompleto", expression = "java(MapeoUtils.nombreEmpleado(empleado))")
    @Mapping(target = "correo", source = "usuario.correo")
    @Mapping(target = "telefono", source = "usuario.telefono")
    @Mapping(target = "rol", source = "usuario.rol")
    @Mapping(target = "sucursalId", source = "sucursal.id")
    @Mapping(target = "sucursalNombre", source = "sucursal.nombre")
    @Mapping(target = "horaInicio", source = "horario.horaInicio")
    @Mapping(target = "horaFin", source = "horario.horaFin")
    EmpleadoResponse toResponse(Empleado empleado);

    List<EmpleadoResponse> toResponses(List<Empleado> empleados);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    @Mapping(target = "documento.tipo", source = "tipoDocumento")
    @Mapping(target = "documento.numero", source = "numeroDocumento")
    Usuario toUsuario(EmpleadoRequest request);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    @Mapping(target = "documento.tipo", source = "tipoDocumento")
    @Mapping(target = "documento.numero", source = "numeroDocumento")
    void updateUsuario(EmpleadoRequest request, @MappingTarget Usuario usuario);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    @Mapping(target = "horario.horaInicio", source = "horaInicio")
    @Mapping(target = "horario.horaFin", source = "horaFin")
    Empleado toEmpleado(EmpleadoRequest request);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    @Mapping(target = "horario.horaInicio", source = "horaInicio")
    @Mapping(target = "horario.horaFin", source = "horaFin")
    void updateEmpleado(EmpleadoRequest request, @MappingTarget Empleado empleado);
}
