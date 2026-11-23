package com.totospizza.repository.seguridad;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.totospizza.model.entity.seguridad.Empleado;
import com.totospizza.model.entity.seguridad.Usuario;
import com.totospizza.model.enums.EstadoEmpleado;
import com.totospizza.model.enums.Rol;
import com.totospizza.repository.seguridad.projection.EmpleadosPorEstado;

/**
 * Acceso a los datos laborales de los empleados.
 */
public interface EmpleadoRepository extends JpaRepository<Empleado, Long> {

    /** Busca los datos laborales de un usuario. */
    @EntityGraph(attributePaths = {"sucursal"})
    Optional<Empleado> findByUsuarioId(Long usuarioId);

    /**
     * Directorio del equipo con filtros por sucursal, cargo y estado. 
     */
    @EntityGraph(attributePaths = {"usuario", "sucursal"})
    @Query(value = """
            select e from Empleado e join e.usuario u
            where (:sucursalId is null or e.sucursal.id = :sucursalId)
              and (:rol is null or u.rol = :rol)
              and (:estado is null or e.estado = :estado)
              and (lower(u.nombres) like :patron or lower(u.apellidos) like :patron or lower(u.correo) like :patron or u.documento.numero like :patron)
            """,
            countQuery = """
            select count(e) from Empleado e join e.usuario u
            where (:sucursalId is null or e.sucursal.id = :sucursalId)
              and (:rol is null or u.rol = :rol)
              and (:estado is null or e.estado = :estado)
              and (lower(u.nombres) like :patron or lower(u.apellidos) like :patron or lower(u.correo) like :patron or u.documento.numero like :patron)
            """)
    Page<Empleado> buscar(@Param("sucursalId") Long sucursalId, @Param("rol") Rol rol, @Param("estado") EstadoEmpleado estado, @Param("patron") String patron, Pageable pageable);

    /**
     * Empleados activos de un rol y estado en una sucursal. Para elegir qué motorizado recibe una entrega.
     */
    @EntityGraph(attributePaths = {"usuario"})
    @Query("""
            select e from Empleado e join e.usuario u
            where e.sucursal.id = :sucursalId and u.rol = :rol and e.estado = :estado and u.activo = true
            order by u.nombres asc
            """)
    List<Empleado> findDisponibles(@Param("sucursalId") Long sucursalId, @Param("rol") Rol rol, @Param("estado") EstadoEmpleado estado);

    /** Cantidad de empleados por estado en una sucursal. */
    @Query("""
            select e.estado as estado, count(e) as cantidad from Empleado e where e.sucursal.id = :sucursalId group by e.estado
            """)
    List<EmpleadosPorEstado> contarPorEstado(@Param("sucursalId") Long sucursalId);

    /** Total de empleados registrados en una sucursal. */
    /**
     * Usuarios activos de un rol que trabajan en una sucursal. Para avisar a la cocina o al mostrador de esa sede.
     */
    @Query("""
            select e.usuario from Empleado e
            where e.sucursal.id = :sucursalId and e.usuario.rol = :rol and e.usuario.activo = true
            """)
    List<Usuario> findUsuariosActivosPorRolYSucursal(@Param("rol") Rol rol, @Param("sucursalId") Long sucursalId);

    long countBySucursalId(Long sucursalId);
}
