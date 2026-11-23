package com.totospizza.model.entity.pedido;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.totospizza.model.entity.AuditableEntity;
import com.totospizza.model.entity.seguridad.Usuario;
import com.totospizza.model.enums.EstadoCarrito;

/**
 * Selección de productos de un cliente antes de pagar.
 */
@Entity
@Table(
    name = "carritos",
    indexes = {
        @Index(name = "idx_carritos_usuario_estado", columnList = "usuario_id, estado")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class Carrito extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoCarrito estado;

    @OneToMany(mappedBy = "carrito", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemCarrito> items = new ArrayList<>();
}
