package com.totospizza.controller.publico;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.response.resena.ResenaResponse;
import com.totospizza.dto.response.resena.ResumenCalificacionResponse;
import com.totospizza.service.resena.ResenaService;

/** Reseñas destacadas y calificación de cada producto. */
@RestController
@RequestMapping("/api/v1/publico")
@RequiredArgsConstructor
public class ResenaPublicaController {

    private static final int LIMITE_DESTACADAS = 20;

    private final ResenaService resenaService;

    @GetMapping("/resenas/destacadas")
    public List<ResenaResponse> destacadas(@RequestParam(defaultValue = "6") int limite) {
        return resenaService.destacadas(Math.min(Math.max(limite, 1), LIMITE_DESTACADAS));
    }

    @GetMapping("/productos/{productoId}/calificacion")
    public ResumenCalificacionResponse calificacion(@PathVariable Long productoId) {
        return resenaService.resumenProducto(productoId);
    }
}
