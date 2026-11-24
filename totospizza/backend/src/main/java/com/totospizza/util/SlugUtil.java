package com.totospizza.util;

import java.text.Normalizer;
import java.util.Locale;
import java.util.function.Predicate;

/** Genera slugs para URL: sin tildes, en minúsculas y con guiones. */
public final class SlugUtil {

    private SlugUtil() {
    }

    public static String slugify(String texto) {
        String base = Normalizer.normalize(texto == null ? "" : texto, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-+|-+$)", "");
        return base.isEmpty() ? "producto" : base;
    }

    public static String unico(String texto, Predicate<String> existe) {
        String base = slugify(texto);
        String candidato = base;
        int n = 2;
        while (existe.test(candidato)) {
            candidato = base + "-" + n++;
        }
        return candidato;
    }
}
