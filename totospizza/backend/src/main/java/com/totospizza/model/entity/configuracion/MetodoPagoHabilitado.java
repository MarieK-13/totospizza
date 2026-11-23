package com.totospizza.model.entity.configuracion;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.totospizza.model.entity.AuditableEntity;
import com.totospizza.model.enums.MetodoPago;

/**
 * Indica qué métodos de pago están activos y en qué orden se muestran en el checkout.
 */
@Entity
@Table(
    name = "metodos_pago_habilitados",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_metodos_pago_habilitados_metodo", columnNames = "metodo")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class MetodoPagoHabilitado extends AuditableEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo", nullable = false)
    private MetodoPago metodo;

    @Column(name = "activo", nullable = false)
    private boolean activo = true;

    @Column(name = "orden", nullable = false)
    private Integer orden = 0;
}
