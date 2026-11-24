package com.totospizza.mapper.catalogo;

import java.util.List;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import com.totospizza.dto.request.catalogo.PromocionRequest;
import com.totospizza.dto.response.catalogo.PromocionAdminResponse;
import com.totospizza.dto.response.catalogo.PromocionItemResponse;
import com.totospizza.dto.response.catalogo.PromocionResponse;
import com.totospizza.mapper.MapperBaseConfig;
import com.totospizza.model.entity.catalogo.Promocion;
import com.totospizza.model.entity.catalogo.PromocionItem;

@Mapper(config = MapperBaseConfig.class)
public interface PromocionMapper {

    PromocionResponse toResponse(Promocion promocion);

    List<PromocionResponse> toResponses(List<Promocion> promociones);

    PromocionAdminResponse toAdminResponse(Promocion promocion);

    List<PromocionAdminResponse> toAdminResponses(List<Promocion> promociones);

    @Mapping(target = "productoId", source = "producto.id")
    @Mapping(target = "productoNombre", source = "producto.nombre")
    @Mapping(target = "tamanoId", source = "tamano.id")
    @Mapping(target = "tamanoNombre", source = "tamano.nombre")
    PromocionItemResponse toItem(PromocionItem item);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    @Mapping(target = "items", ignore = true)
    Promocion toEntity(PromocionRequest request);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    @Mapping(target = "items", ignore = true)
    void updateEntity(PromocionRequest request, @MappingTarget Promocion promocion);
}
