package com.totospizza.model.entity.catalogo;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.totospizza.model.entity.AuditableEntity;
import com.totospizza.model.enums.ColorPromocion;
import com.totospizza.model.enums.TipoPromocion;

/**
 * Oferta que se muestra en el banner del Home
 */

@Entity
@Table(
    name = "promociones",
    indexes = {
        @Index(name = "idx_promociones_activa_vigencia", columnList = "activa, vigente_hasta")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class Promocion extends AuditableEntity {

    @NotBlank
    @Column(name = "titulo", nullable = false)
    private String titulo;

    @Column(name = "descripcion", columnDefinition = "text")
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false)
    private TipoPromocion tipo;

    @Column(name = "etiqueta")
    private String etiqueta;

    @Column(name = "precio_promocional", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioPromocional;

    @Column(name = "precio_anterior", precision = 10, scale = 2)
    private BigDecimal precioAnterior;

    /** Costo de producir la oferta. Si el precio promocional es menor, se genera una alerta de pérdida. */
    @Column(name = "costo_estimado", precision = 10, scale = 2)
    private BigDecimal costoEstimado;

    @Column(name = "imagen_url")
    private String imagenUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "color_fondo", nullable = false)
    private ColorPromocion colorFondo;

    /** Texto legal, por ejemplo "Válido de lunes a jueves". */
    @Column(name = "condiciones", columnDefinition = "text")
    private String condiciones;

    @Column(name = "vigente_desde")
    private Instant vigenteDesde;

    @Column(name = "vigente_hasta")
    private Instant vigenteHasta;

    @Column(name = "activa", nullable = false)
    private boolean activa = true;

    @Column(name = "orden", nullable = false)
    private Integer orden = 0;

    @OneToMany(mappedBy = "promocion", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PromocionItem> items = new ArrayList<>();
}
