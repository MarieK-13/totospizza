package com.totospizza.dto.response.seguridad;

import java.time.LocalDate;
import java.util.List;

import com.totospizza.model.enums.Rol;
import com.totospizza.model.enums.TipoDocumento;

/**
 * Perfil completo del cliente autenticado.
 */
public record PerfilResponse(
        Long id,
        String nombres,
        String apellidos,
        TipoDocumento tipoDocumento,
        String numeroDocumento,
        LocalDate fechaNacimiento,
        String telefono,
        String correo,
        Rol rol,
        String avatarUrl,
        List<DireccionClienteResponse> direcciones
) {
}
