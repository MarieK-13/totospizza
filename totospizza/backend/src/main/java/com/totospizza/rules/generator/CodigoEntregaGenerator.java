package com.totospizza.rules.generator;

import java.security.SecureRandom;

/** Código de 4 dígitos que el cliente dicta al motorizado para confirmar la entrega. */
public final class CodigoEntregaGenerator {

    private static final SecureRandom RANDOM = new SecureRandom();

    private CodigoEntregaGenerator() {
    }

    public static String generar() {
        return String.format("%04d", RANDOM.nextInt(10_000));
    }
}
