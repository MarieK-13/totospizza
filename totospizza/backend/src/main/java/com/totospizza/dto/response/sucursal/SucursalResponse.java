package com.totospizza.dto.response.sucursal;

import java.math.BigDecimal;
import java.util.List;

import com.totospizza.dto.response.seguridad.DireccionResponse;
import com.totospizza.model.enums.Rol;

/**
 * Sucursal con horarios y zonas.
 */
public record SucursalResponse(
        Long id,
        String nombre,
        DireccionResponse direccion,
        String telefono,
        String imagenUrl,
        boolean activa,
        BigDecimal radioCoberturaKm,
        boolean abiertoAhora,
        List<HorarioSucursalResponse> horarios,
        List<ZonaRepartoResponse> zonas,
        /** Roles operativos sin ningún empleado activo (pizzero, despachador, motorizado). Vacío = puede atender delivery. */
        List<Rol> personalFaltante
) {
}
