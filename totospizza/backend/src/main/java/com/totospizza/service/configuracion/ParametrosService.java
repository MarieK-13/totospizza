package com.totospizza.service.configuracion;

import java.math.BigDecimal;
import java.util.Optional;

/**
 * Lectura tipada de los parámetros del sistema para el resto de servicios. Si la clave no
 * existe o su valor no es válido, devuelve el valor por defecto: una configuración incompleta
 * nunca debe tumbar una venta.
 */
public interface ParametrosService {

    BigDecimal numero(String clave, BigDecimal porDefecto);

    int entero(String clave, int porDefecto);

    Optional<Long> idOpcional(String clave);
}
