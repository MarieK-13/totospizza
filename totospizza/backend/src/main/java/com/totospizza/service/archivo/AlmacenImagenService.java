package com.totospizza.service.archivo;

import org.springframework.web.multipart.MultipartFile;

import com.totospizza.model.enums.CarpetaImagen;

/** Guarda imágenes en el disco del servidor. */
public interface AlmacenImagenService {

    /**
     * Valida y guarda la imagen.
     *
     * @return ruta pública, por ejemplo {@code /uploads/productos/3f2a….webp}
     */
    String guardar(MultipartFile archivo, CarpetaImagen carpeta);
}
