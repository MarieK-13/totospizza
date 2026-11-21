package com.totospizza.model.entity.seguridad;

import java.time.Instant;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.totospizza.model.embeddable.DocumentoIdentidad;
import com.totospizza.model.entity.AuditableEntity;
import com.totospizza.model.enums.Rol;

/**
 * Persona con acceso al sistema. El rol determina qué puede hacer: cliente, pizzero, despachador, motorizado o administrador.
 */
@Entity
@Table(
    name = "usuarios",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_usuarios_correo", columnNames = "correo"),
        @UniqueConstraint(name = "uq_usuarios_documento", columnNames = {"tipo_documento", "numero_documento"})
    },
    indexes = {
        @Index(name = "idx_usuarios_rol", columnList = "rol")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class Usuario extends AuditableEntity {

    @NotBlank
    @Size(max = 100)
    @Column(name = "nombres", nullable = false)
    private String nombres;

    @NotBlank
    @Size(max = 100)
    @Column(name = "apellidos", nullable = false)
    private String apellidos;

    @Embedded
    private DocumentoIdentidad documento;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Size(max = 20)
    @Column(name = "telefono")
    private String telefono;

    @NotBlank
    @Email
    @Size(max = 150)
    @Column(name = "correo", nullable = false)
    private String correo;

    /** Hash BCrypt. La contraseña nunca se guarda en claro. */
    @Column(name = "contrasena_hash", nullable = false)
    private String contrasenaHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "rol", nullable = false)
    private Rol rol;

    @Column(name = "activo", nullable = false)
    private boolean activo = true;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "ultimo_acceso")
    private Instant ultimoAcceso;
}
