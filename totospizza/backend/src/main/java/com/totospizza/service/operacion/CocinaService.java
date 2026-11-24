package com.totospizza.service.operacion;

import com.totospizza.dto.response.operacion.TableroCocinaResponse;

public interface CocinaService {

    TableroCocinaResponse tablero(Long usuarioId);

    TableroCocinaResponse iniciarPreparacion(Long usuarioId, Long pedidoId);

    TableroCocinaResponse enviarAlHorno(Long usuarioId, Long pedidoId);

    TableroCocinaResponse marcarListo(Long usuarioId, Long pedidoId);
}
