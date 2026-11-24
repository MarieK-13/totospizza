package com.totospizza.service.impl.archivo;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import com.totospizza.config.ArchivosConfig;
import com.totospizza.config.ArchivosProperties;
import com.totospizza.exception.ReglaNegocioException;
import com.totospizza.model.enums.CarpetaImagen;
import com.totospizza.service.archivo.AlmacenImagenService;

/**
 * Acepta JPG, PNG y WebP. El tipo se comprueba por los primeros bytes del archivo (no por su nombre)
 * y se guarda con un nombre aleatorio, así nadie puede subir un ejecutable renombrado ni pisar otro archivo.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AlmacenImagenServiceImpl implements AlmacenImagenService {

    private final ArchivosProperties propiedades;

    @Override
    public String guardar(MultipartFile archivo, CarpetaImagen carpeta) {
        if (archivo == null || archivo.isEmpty()) {
            throw new ReglaNegocioException("IMAGEN_REQUERIDA", "Elige una imagen para subir");
        }
        if (archivo.getSize() > propiedades.tamanoMaximoImagen().toBytes()) {
            throw new ReglaNegocioException("IMAGEN_MUY_GRANDE",
                    "La imagen pesa más de " + propiedades.tamanoMaximoImagen().toMegabytes() + " MB");
        }
        String extension = extension(archivo);
        Path destinoCarpeta = Path.of(propiedades.directorio(), carpeta.ruta()).toAbsolutePath().normalize();
        String nombre = UUID.randomUUID() + "." + extension;
        Path destino = destinoCarpeta.resolve(nombre).normalize();
        try (InputStream contenido = archivo.getInputStream()) {
            Files.createDirectories(destinoCarpeta);
            Files.copy(contenido, destino, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            log.error("No se pudo guardar la imagen en {}", destino, e);
            throw new ReglaNegocioException("IMAGEN_NO_GUARDADA", "No pudimos guardar la imagen. Inténtalo de nuevo");
        }
        return ArchivosConfig.RUTA_PUBLICA + carpeta.ruta() + "/" + nombre;
    }

    private static String extension(MultipartFile archivo) {
        byte[] cabecera = new byte[12];
        try (InputStream contenido = archivo.getInputStream()) {
            int leidos = contenido.readNBytes(cabecera, 0, cabecera.length);
            cabecera = Arrays.copyOf(cabecera, leidos);
        } catch (IOException e) {
            throw new ReglaNegocioException("IMAGEN_INVALIDA", "No pudimos leer la imagen");
        }
        if (empiezaCon(cabecera, 0xFF, 0xD8, 0xFF)) {
            return "jpg";
        }
        if (empiezaCon(cabecera, 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A)) {
            return "png";
        }
        if (cabecera.length >= 12 && empiezaCon(cabecera, 'R', 'I', 'F', 'F')
                && cabecera[8] == 'W' && cabecera[9] == 'E' && cabecera[10] == 'B' && cabecera[11] == 'P') {
            return "webp";
        }
        throw new ReglaNegocioException("IMAGEN_INVALIDA", "Solo se aceptan imágenes JPG, PNG o WebP");
    }

    private static boolean empiezaCon(byte[] datos, int... firma) {
        if (datos.length < firma.length) {
            return false;
        }
        for (int i = 0; i < firma.length; i++) {
            if ((datos[i] & 0xFF) != firma[i]) {
                return false;
            }
        }
        return true;
    }
}
