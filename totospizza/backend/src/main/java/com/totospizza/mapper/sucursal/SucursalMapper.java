package com.totospizza.mapper.sucursal;

import java.util.List;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import com.totospizza.dto.request.sucursal.HorarioSucursalRequest;
import com.totospizza.dto.request.sucursal.SucursalRequest;
import com.totospizza.dto.request.sucursal.ZonaRepartoRequest;
import com.totospizza.dto.response.sucursal.HorarioSucursalResponse;
import com.totospizza.dto.response.sucursal.SucursalResponse;
import com.totospizza.dto.response.sucursal.ZonaRepartoResponse;
import com.totospizza.mapper.MapperBaseConfig;
import com.totospizza.mapper.seguridad.DireccionMapper;
import com.totospizza.model.entity.sucursal.HorarioSucursal;
import com.totospizza.model.entity.sucursal.Sucursal;
import com.totospizza.model.entity.sucursal.ZonaReparto;
import com.totospizza.model.enums.Rol;


@Mapper(config = MapperBaseConfig.class, uses = DireccionMapper.class)
public interface SucursalMapper {

    @Mapping(target = ".", source = "sucursal")
    @Mapping(target = "abiertoAhora", source = "abiertoAhora")
    @Mapping(target = "personalFaltante", source = "personalFaltante")
    SucursalResponse toResponse(Sucursal sucursal, boolean abiertoAhora, List<Rol> personalFaltante);

    @Mapping(target = "horaApertura", source = "horario.horaInicio")
    @Mapping(target = "horaCierre", source = "horario.horaFin")
    HorarioSucursalResponse toHorario(HorarioSucursal horario);

    ZonaRepartoResponse toZona(ZonaReparto zona);

    List<ZonaRepartoResponse> toZonas(List<ZonaReparto> zonas);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    @Mapping(target = "horarios", ignore = true)
    @Mapping(target = "zonas", ignore = true)
    Sucursal toEntity(SucursalRequest request);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    @Mapping(target = "horarios", ignore = true)
    @Mapping(target = "zonas", ignore = true)
    void updateEntity(SucursalRequest request, @MappingTarget Sucursal sucursal);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    @Mapping(target = "horario.horaInicio", source = "horaApertura")
    @Mapping(target = "horario.horaFin", source = "horaCierre")
    HorarioSucursal toEntity(HorarioSucursalRequest request);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    ZonaReparto toEntity(ZonaRepartoRequest request);
}
