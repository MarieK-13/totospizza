package com.totospizza.dto.request.configuracion;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Datos del negocio mostrados en el sitio.
 */
public record PerfilNegocioRequest(
        @NotBlank @Size(max = 120) String nombreComercial,
        @Size(max = 160) String razonSocial,
        @Pattern(regexp = "^\\d{11}$", message = "El RUC debe tener 11 dígitos") String ruc,
        @Size(max = 500) String logoUrl,
        @Email @Size(max = 120) String correoContacto,
        @Pattern(regexp = "^9\\d{8}$", message = "El teléfono debe tener 9 dígitos y empezar con 9")
        String telefonoContacto,
        @Size(max = 200) String direccionFiscal,
        @Size(max = 200) String instagramUrl,
        @Size(max = 200) String facebookUrl,
        @Pattern(regexp = "^9\\d{8}$", message = "El WhatsApp debe tener 9 dígitos y empezar con 9")
        String whatsapp
) {
}
