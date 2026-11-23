package com.totospizza.dto.response.configuracion;

/**
 * Datos del negocio.
 */
public record PerfilNegocioResponse(
        String nombreComercial,
        String razonSocial,
        String ruc,
        String logoUrl,
        String correoContacto,
        String telefonoContacto,
        String direccionFiscal,
        String instagramUrl,
        String facebookUrl,
        String whatsapp
) {
}
