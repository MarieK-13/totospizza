package com.totospizza.integration.pagos;

/** Respuesta de la pasarela a un reembolso. */
public record ResultadoReembolso(boolean exitoso, String motivoFallo) {
}
