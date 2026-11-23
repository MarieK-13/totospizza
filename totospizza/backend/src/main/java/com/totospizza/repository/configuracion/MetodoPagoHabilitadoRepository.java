package com.totospizza.repository.configuracion;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.totospizza.model.entity.configuracion.MetodoPagoHabilitado;
import com.totospizza.model.enums.MetodoPago;

/**
 * Métodos de pago habilitados.
 */
public interface MetodoPagoHabilitadoRepository extends JpaRepository<MetodoPagoHabilitado, Long> {

    /** Métodos de pago activos para el checkout. */
    List<MetodoPagoHabilitado> findByActivoTrueOrderByOrdenAsc();

    /** Todos los métodos de pago para la pantalla de configuración. */
    List<MetodoPagoHabilitado> findAllByOrderByOrdenAsc();

    /** Busca la configuración de un método de pago. */
    Optional<MetodoPagoHabilitado> findByMetodo(MetodoPago metodo);
}
