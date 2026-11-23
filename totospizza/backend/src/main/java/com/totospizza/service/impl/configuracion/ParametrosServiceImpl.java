package com.totospizza.service.impl.configuracion;

import java.math.BigDecimal;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import com.totospizza.model.entity.configuracion.ParametroSistema;
import com.totospizza.repository.configuracion.ParametroSistemaRepository;
import com.totospizza.service.configuracion.ParametrosService;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ParametrosServiceImpl implements ParametrosService {

    private final ParametroSistemaRepository parametroRepository;

    @Override
    public BigDecimal numero(String clave, BigDecimal porDefecto) {
        return valor(clave).map(v -> parsear(clave, v)).orElse(porDefecto);
    }

    @Override
    public int entero(String clave, int porDefecto) {
        return valor(clave).map(v -> parsear(clave, v)).map(BigDecimal::intValue).orElse(porDefecto);
    }

    @Override
    public Optional<Long> idOpcional(String clave) {
        return valor(clave).map(v -> parsear(clave, v)).map(BigDecimal::longValue);
    }

    private Optional<String> valor(String clave) {
        return parametroRepository.findByClave(clave)
                .map(ParametroSistema::getValor)
                .filter(v -> !v.isBlank());
    }

    private BigDecimal parsear(String clave, String valor) {
        try {
            return new BigDecimal(valor.trim());
        } catch (NumberFormatException e) {
            log.warn("El parámetro '{}' tiene un valor no numérico ('{}'); se usará el valor por defecto", clave, valor);
            return null;
        }
    }
}
