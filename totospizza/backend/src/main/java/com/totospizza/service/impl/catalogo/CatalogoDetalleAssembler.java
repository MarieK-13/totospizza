package com.totospizza.service.impl.catalogo;

import java.util.EnumSet;
import java.util.List;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.response.catalogo.ProductoDetalleResponse;
import com.totospizza.mapper.catalogo.ProductoMapper;
import com.totospizza.model.entity.catalogo.Ingrediente;
import com.totospizza.model.entity.catalogo.Producto;
import com.totospizza.model.entity.catalogo.TipoMasa;
import com.totospizza.model.enums.TipoIngrediente;
import com.totospizza.repository.catalogo.IngredienteRepository;
import com.totospizza.repository.catalogo.TipoMasaRepository;

@Component
@RequiredArgsConstructor
class CatalogoDetalleAssembler {

    private final ProductoMapper productoMapper;
    private final TipoMasaRepository tipoMasaRepository;
    private final IngredienteRepository ingredienteRepository;

    ProductoDetalleResponse armar(Producto producto) {
        List<TipoMasa> masas = producto.isRequiereTamano()
                ? tipoMasaRepository.findByActivaTrueOrderByNombreAsc()
                : List.of();
        List<Ingrediente> adicionales = producto.isRequiereTamano()
                ? ingredienteRepository.findByTipoInAndDisponibleTrueOrderByTipoAscNombreAsc(EnumSet.allOf(TipoIngrediente.class))
                : List.of();
        return productoMapper.toDetalle(producto, masas, adicionales);
    }
}
