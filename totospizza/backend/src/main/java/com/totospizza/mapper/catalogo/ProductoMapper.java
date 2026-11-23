package com.totospizza.mapper.catalogo;

import java.util.List;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import com.totospizza.dto.request.catalogo.ProductoRequest;
import com.totospizza.dto.response.catalogo.PrecioTamanoResponse;
import com.totospizza.dto.response.catalogo.ProductoDetalleResponse;
import com.totospizza.dto.response.catalogo.ProductoResumenResponse;
import com.totospizza.mapper.MapeoUtils;
import com.totospizza.mapper.MapperBaseConfig;
import com.totospizza.model.entity.catalogo.Ingrediente;
import com.totospizza.model.entity.catalogo.Producto;
import com.totospizza.model.entity.catalogo.ProductoTamano;
import com.totospizza.model.entity.catalogo.TipoMasa;


@Mapper(
        config = MapperBaseConfig.class,
        imports = MapeoUtils.class,
        uses = {CategoriaMapper.class, EtiquetaMapper.class, TipoMasaMapper.class, IngredienteMapper.class}
)
public interface ProductoMapper {

    @Mapping(target = "categoria", source = "categoria.nombre")
    @Mapping(target = "precioDesde", expression = "java(MapeoUtils.precioDesde(producto))")
    ProductoResumenResponse toResumen(Producto producto);

    List<ProductoResumenResponse> toResumenes(List<Producto> productos);

    @Mapping(target = ".", source = "producto")
    @Mapping(target = "tiposMasa", source = "tiposMasa")
    @Mapping(target = "adicionales", source = "adicionales")
    ProductoDetalleResponse toDetalle(Producto producto, List<TipoMasa> tiposMasa, List<Ingrediente> adicionales);

    @Mapping(target = "tamanoId", source = "tamano.id")
    @Mapping(target = "tamanoNombre", source = "tamano.nombre")
    PrecioTamanoResponse toPrecio(ProductoTamano productoTamano);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    @Mapping(target = "precios", ignore = true)
    Producto toEntity(ProductoRequest request);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    @Mapping(target = "precios", ignore = true)
    void updateEntity(ProductoRequest request, @MappingTarget Producto producto);
}
