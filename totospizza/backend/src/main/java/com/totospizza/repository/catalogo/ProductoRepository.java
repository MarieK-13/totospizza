package com.totospizza.repository.catalogo;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.totospizza.model.entity.catalogo.Producto;

/**
 * Acceso a la carta.
 */
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    /**
     * Productos disponibles del menú. Los filtros nulos se ignoran.
     * Con {@code tamanoId} solo quedan los que tienen precio para ese tamaño.
     */
    @EntityGraph(attributePaths = {"categoria"})
    @Query(value = """
            select p from Producto p
            where p.disponible = true
              and (:categoriaSlug is null or p.categoria.slug = :categoriaSlug)
              and (:etiquetaSlug is null or exists (select 1 from p.etiquetas e where e.slug = :etiquetaSlug))
              and (:tamanoId is null or exists (select 1 from p.precios pt where pt.tamano.id = :tamanoId))
              and lower(p.nombre) like :patron
            """,
            countQuery = """
            select count(p) from Producto p
            where p.disponible = true
              and (:categoriaSlug is null or p.categoria.slug = :categoriaSlug)
              and (:etiquetaSlug is null or exists (select 1 from p.etiquetas e where e.slug = :etiquetaSlug))
              and (:tamanoId is null or exists (select 1 from p.precios pt where pt.tamano.id = :tamanoId))
              and lower(p.nombre) like :patron
            """)
    Page<Producto> buscarEnMenu(@Param("categoriaSlug") String categoriaSlug, @Param("etiquetaSlug") String etiquetaSlug,
                                @Param("tamanoId") Long tamanoId, @Param("patron") String patron, Pageable pageable);

    /**
     * Detalle de un producto con su categoría y precios por tamaño.
     * Las etiquetas NO van en el mismo EntityGraph: traer dos colecciones en un solo join
     * repite los precios una vez por cada etiqueta (producto cartesiano). Se cargan aparte,
     * dentro de la transacción del servicio.
     */
    @EntityGraph(attributePaths = {"categoria", "precios", "precios.tamano"})
    Optional<Producto> findBySlugAndDisponibleTrue(String slug);

    /** Productos destacados para "Recomendado para ti". Usa Pageable solo para limitar la cantidad. */
    @EntityGraph(attributePaths = {"categoria"})
    List<Producto> findByDestacadoTrueAndDisponibleTrueOrderByNombreAsc(Pageable pageable);

    /** Productos disponibles de una categoría, por ejemplo los antojitos. */
    List<Producto> findByCategoriaSlugAndDisponibleTrueOrderByNombreAsc(String slug);

    /** Carga de una sola vez los productos del carrito para validarlos. */
    List<Producto> findByIdInAndDisponibleTrue(Collection<Long> ids);

    /** Indica si ya existe un producto con ese slug. */
    /**
     * Nombres de los productos que hoy están en el menú. Base del ranking de menos vendidos, que debe incluir los de cero ventas.
     */
    @Query("select p.nombre from Producto p where p.disponible = true order by p.nombre asc")
    List<String> findNombresDisponibles();

    boolean existsBySlug(String slug);

    boolean existsByCategoriaId(Long categoriaId);

    /** Guarda el promedio de estrellas y el total de reseñas de un producto. */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("""
            update Producto p set p.calificacionPromedio = :promedio, p.totalResenas = :total, p.actualizadoEn = :ahora where p.id = :id
            """)
    int actualizarCalificacion(@Param("id") Long id, @Param("promedio") BigDecimal promedio, @Param("total") Integer total, @Param("ahora") Instant ahora);
}
