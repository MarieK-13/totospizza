package com.totospizza.mapper.seguridad;

import java.util.List;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import com.totospizza.dto.request.seguridad.ActualizarPerfilRequest;
import com.totospizza.dto.request.seguridad.RegistroRequest;
import com.totospizza.dto.response.seguridad.PerfilResponse;
import com.totospizza.dto.response.seguridad.UsuarioResponse;
import com.totospizza.mapper.MapperBaseConfig;
import com.totospizza.model.entity.seguridad.DireccionCliente;
import com.totospizza.model.entity.seguridad.Usuario;

@Mapper(config = MapperBaseConfig.class, uses = DireccionMapper.class)
public interface UsuarioMapper {

    UsuarioResponse toResponse(Usuario usuario);

    @Mapping(target = ".", source = "usuario")
    @Mapping(target = "tipoDocumento", source = "usuario.documento.tipo")
    @Mapping(target = "numeroDocumento", source = "usuario.documento.numero")
    @Mapping(target = "direcciones", source = "direcciones")
    PerfilResponse toPerfil(Usuario usuario, List<DireccionCliente> direcciones);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    @Mapping(target = "documento.tipo", source = "tipoDocumento")
    @Mapping(target = "documento.numero", source = "numeroDocumento")
    Usuario toEntity(RegistroRequest request);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    void updateEntity(ActualizarPerfilRequest request, @MappingTarget Usuario usuario);
}
