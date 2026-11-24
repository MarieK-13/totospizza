package com.totospizza.controller.admin;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import lombok.RequiredArgsConstructor;

import com.totospizza.dto.response.archivo.ImagenResponse;
import com.totospizza.model.enums.CarpetaImagen;
import com.totospizza.service.archivo.AlmacenImagenService;

/** Subida de imágenes de productos, promociones, sedes y del negocio. */
@RestController
@RequestMapping("/api/v1/admin/imagenes")
@PreAuthorize("hasRole('ADMINISTRADOR')")
@RequiredArgsConstructor
public class AdminImagenController {

    private final AlmacenImagenService almacenImagenService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ImagenResponse subir(@RequestPart("archivo") MultipartFile archivo,
                                @RequestParam(defaultValue = "PRODUCTOS") CarpetaImagen carpeta) {
        String ruta = almacenImagenService.guardar(archivo, carpeta);
        return new ImagenResponse(ServletUriComponentsBuilder.fromCurrentContextPath().path(ruta).toUriString());
    }
}
