package com.totospizza.repository.catalogo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.totospizza.model.entity.catalogo.ProductoTamano;

/**
 * Precios de los productos por tamaño.
 */
public interface ProductoTamanoRepository extends JpaRepository<ProductoTamano, Long> {

    /** Precio de un producto en un tamaño. */
    Optional<ProductoTamano> findByProductoIdAndTamanoId(Long productoId, Long tamanoId);
}
