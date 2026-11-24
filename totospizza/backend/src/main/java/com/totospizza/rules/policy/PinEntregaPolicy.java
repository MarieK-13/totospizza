package com.totospizza.rules.policy;

/**
 * Límite de intentos para confirmar una entrega con el PIN del cliente.
 */
public final class PinEntregaPolicy {

    /** Intentos fallidos permitidos antes de bloquear la confirmación. */
    public static final int MAX_INTENTOS = 5;

    private PinEntregaPolicy() {
    }

    public static boolean bloqueado(Integer intentosFallidos) {
        return restantes(intentosFallidos) == 0;
    }

    public static int restantes(Integer intentosFallidos) {
        int fallidos = intentosFallidos == null ? 0 : intentosFallidos;
        return Math.max(0, MAX_INTENTOS - fallidos);
    }
}
