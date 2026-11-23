package com.totospizza.mapper.configuracion;

import java.util.List;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import com.totospizza.dto.request.configuracion.MetodoPagoHabilitadoRequest;
import com.totospizza.dto.request.configuracion.ParametroSistemaRequest;
import com.totospizza.dto.request.configuracion.PerfilNegocioRequest;
import com.totospizza.dto.response.configuracion.MetodoPagoHabilitadoResponse;
import com.totospizza.dto.response.configuracion.ParametroSistemaResponse;
import com.totospizza.dto.response.configuracion.PerfilNegocioResponse;
import com.totospizza.dto.response.pago.MetodoPagoDisponibleResponse;
import com.totospizza.mapper.MapperBaseConfig;
import com.totospizza.model.entity.configuracion.MetodoPagoHabilitado;
import com.totospizza.model.entity.configuracion.ParametroSistema;
import com.totospizza.model.entity.configuracion.PerfilNegocio;


@Mapper(config = MapperBaseConfig.class)
public interface ConfiguracionMapper {

    PerfilNegocioResponse toResponse(PerfilNegocio perfil);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    void updateEntity(PerfilNegocioRequest request, @MappingTarget PerfilNegocio perfil);

    ParametroSistemaResponse toResponse(ParametroSistema parametro);

    List<ParametroSistemaResponse> toParametros(List<ParametroSistema> parametros);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    void updateEntity(ParametroSistemaRequest request, @MappingTarget ParametroSistema parametro);

    @Mapping(target = "etiqueta", source = "metodo.etiqueta")
    MetodoPagoHabilitadoResponse toResponse(MetodoPagoHabilitado habilitado);

    List<MetodoPagoHabilitadoResponse> toMetodos(List<MetodoPagoHabilitado> habilitados);

    @Mapping(target = "etiqueta", source = "metodo.etiqueta")
    MetodoPagoDisponibleResponse toDisponible(MetodoPagoHabilitado habilitado);

    List<MetodoPagoDisponibleResponse> toDisponibles(List<MetodoPagoHabilitado> habilitados);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    void updateEntity(MetodoPagoHabilitadoRequest request, @MappingTarget MetodoPagoHabilitado habilitado);
}
