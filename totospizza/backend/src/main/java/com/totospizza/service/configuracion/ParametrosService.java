package com.totospizza.service.configuracion;

import java.math.BigDecimal;
import java.util.Optional;

public interface ParametrosService {

    BigDecimal numero(String clave, BigDecimal porDefecto);

    int entero(String clave, int porDefecto);

    Optional<Long> idOpcional(String clave);
}
