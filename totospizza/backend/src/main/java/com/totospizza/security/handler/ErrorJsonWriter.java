package com.totospizza.security.handler;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import com.totospizza.dto.common.ApiError;

final class ErrorJsonWriter {

    private ErrorJsonWriter() {
    }

    static void escribir(HttpServletRequest request, HttpServletResponse response, int estado, String codigo,
                         String mensaje) throws IOException {
        ApiError error = ApiError.of(estado, codigo, mensaje, request.getRequestURI());
        String json = "{\"fecha\":\"" + error.fecha() + "\",\"estado\":" + error.estado()
                + ",\"codigo\":\"" + escapar(error.codigo()) + "\",\"mensaje\":\"" + escapar(error.mensaje())
                + "\",\"ruta\":\"" + escapar(error.ruta()) + "\",\"errores\":[]}";
        response.setStatus(estado);
        response.setContentType("application/json");
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write(json);
    }

    private static String escapar(String texto) {
        StringBuilder salida = new StringBuilder();
        for (char c : texto.toCharArray()) {
            switch (c) {
                case '"' -> salida.append("\\\"");
                case '\\' -> salida.append("\\\\");
                case '\n' -> salida.append("\\n");
                case '\r' -> salida.append("\\r");
                case '\t' -> salida.append("\\t");
                default -> salida.append(c < 0x20 ? String.format("\\u%04x", (int) c) : String.valueOf(c));
            }
        }
        return salida.toString();
    }
}
