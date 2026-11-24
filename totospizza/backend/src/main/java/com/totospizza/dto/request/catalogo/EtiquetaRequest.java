package com.totospizza.dto.request.catalogo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Etiqueta de un producto, por ejemplo un alérgeno ("Contiene gluten") o un rasgo ("Vegetariana").
 * Con {@code esFiltro} aparece como chip para filtrar el menú.
 */
public record EtiquetaRequest(
        @NotBlank @Size(max = 60) String nombre,
        boolean esFiltro
) {
}
