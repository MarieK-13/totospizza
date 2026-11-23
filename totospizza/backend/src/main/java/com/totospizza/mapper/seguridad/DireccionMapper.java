package com.totospizza.mapper.seguridad;

import java.util.List;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import com.totospizza.dto.request.seguridad.DireccionClienteRequest;
import com.totospizza.dto.request.seguridad.DireccionRequest;
import com.totospizza.dto.response.seguridad.DireccionClienteResponse;
import com.totospizza.dto.response.seguridad.DireccionResponse;
import com.totospizza.mapper.MapperBaseConfig;
import com.totospizza.model.embeddable.Direccion;
import com.totospizza.model.entity.seguridad.DireccionCliente;

@Mapper(config = MapperBaseConfig.class)
public interface DireccionMapper {

    DireccionResponse toResponse(Direccion direccion);

    Direccion toEntity(DireccionRequest request);

    DireccionClienteResponse toResponse(DireccionCliente direccionCliente);

    List<DireccionClienteResponse> toResponses(List<DireccionCliente> direcciones);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    DireccionCliente toEntity(DireccionClienteRequest request);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    void updateEntity(DireccionClienteRequest request, @MappingTarget DireccionCliente direccionCliente);
}
