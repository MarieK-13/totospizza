package com.totospizza.dto.request.catalogo;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import com.totospizza.model.enums.ColorPromocion;
import com.totospizza.model.enums.TipoPromocion;

/**
 * Alta o edición de una promoción.
 */
public record PromocionRequest(
        @NotBlank @Size(max = 120) String titulo,
        @Size(max = 500) String descripcion,
        @NotNull TipoPromocion tipo,
        @Size(max = 40) String etiqueta,
        @NotNull @DecimalMin(value = "0.00") @Digits(integer = 8, fraction = 2) BigDecimal precioPromocional,
        @DecimalMin(value = "0.00") @Digits(integer = 8, fraction = 2) BigDecimal precioAnterior,
        @DecimalMin(value = "0.00") @Digits(integer = 8, fraction = 2) BigDecimal costoEstimado,
        @Size(max = 500) String imagenUrl,
        @NotNull ColorPromocion colorFondo,
        @Size(max = 500) String condiciones,
        @NotNull Instant vigenteDesde,
        @NotNull Instant vigenteHasta,
        boolean activa,
        @Min(0) Integer orden,
        @NotEmpty @Valid @Size(max = 20) List<PromocionItemRequest> items
) {
}
