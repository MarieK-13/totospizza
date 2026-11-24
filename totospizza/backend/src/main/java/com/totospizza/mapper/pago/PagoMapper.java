package com.totospizza.mapper.pago;

import org.mapstruct.Mapper;

import com.totospizza.dto.response.pago.PagoResponse;
import com.totospizza.mapper.MapperBaseConfig;
import com.totospizza.model.entity.pago.Pago;

@Mapper(config = MapperBaseConfig.class)
public interface PagoMapper {

    PagoResponse toResponse(Pago pago);
}
