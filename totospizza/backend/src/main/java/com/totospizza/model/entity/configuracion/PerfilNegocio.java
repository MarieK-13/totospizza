package com.totospizza.model.entity.configuracion;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.totospizza.model.entity.AuditableEntity;

/**
 * Datos generales del negocio (una sola fila): nombre comercial, contacto y redes sociales.
 */
@Entity
@Table(
    name = "perfil_negocio"
)
@Getter
@Setter
@NoArgsConstructor
public class PerfilNegocio extends AuditableEntity {

    @NotBlank
    @Column(name = "nombre_comercial", nullable = false)
    private String nombreComercial;

    @Column(name = "razon_social")
    private String razonSocial;

    @Size(max = 11)
    @Column(name = "ruc")
    private String ruc;

    @Column(name = "logo_url")
    private String logoUrl;

    @Email
    @Column(name = "correo_contacto")
    private String correoContacto;

    @Column(name = "telefono_contacto")
    private String telefonoContacto;

    @Column(name = "direccion_fiscal")
    private String direccionFiscal;

    @Column(name = "instagram_url")
    private String instagramUrl;

    @Column(name = "facebook_url")
    private String facebookUrl;

    @Column(name = "whatsapp")
    private String whatsapp;
}
