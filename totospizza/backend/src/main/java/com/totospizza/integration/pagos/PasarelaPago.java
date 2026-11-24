package com.totospizza.integration.pagos;

import java.math.BigDecimal;


public interface PasarelaPago {

    ResultadoCobro cobrar(SolicitudCobro solicitud);

    ResultadoConsulta consultar(String referenciaIntento);

    ResultadoReembolso reembolsar(String referenciaExterna, BigDecimal monto);
}
