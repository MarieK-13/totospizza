package com.totospizza.integration.pagos;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

import com.totospizza.model.enums.MetodoPago;

@Slf4j
@Component
@Profile("!prod")
public class PasarelaPagoSimulada implements PasarelaPago {

    private static final Pattern ULTIMOS_CUATRO = Pattern.compile("(\\d{4})$");

    private final Map<String, ResultadoConsulta> porIntento = new ConcurrentHashMap<>();
    private final Map<String, BigDecimal> reembolsablePorExterna = new ConcurrentHashMap<>();

    @Override
    public ResultadoCobro cobrar(SolicitudCobro solicitud) {
        ResultadoConsulta previo = porIntento.get(solicitud.referencia());
        if (previo != null) {
            return aResultadoCobro(previo);
        }
        String dato = datoDePago(solicitud);
        if ("tok_timeout".equals(dato)) {
            throw new IllegalStateException("Tiempo de espera agotado (simulado)");
        }
        ResultadoConsulta resultado = evaluar(solicitud, dato);
        porIntento.put(solicitud.referencia(), resultado);
        if (resultado.estado() == ResultadoConsulta.Estado.APROBADO) {
            reembolsablePorExterna.put(resultado.referenciaExterna(), solicitud.monto());
        }
        if ("tok_timeout_cobrado".equals(dato)) {
            throw new IllegalStateException("Se cobró pero la respuesta se perdió (simulado)");
        }
        return aResultadoCobro(resultado);
    }

    @Override
    public ResultadoReembolso reembolsar(String referenciaExterna, BigDecimal monto) {
        BigDecimal disponible = reembolsablePorExterna.get(referenciaExterna);
        if (disponible == null) {
            return new ResultadoReembolso(false, "Cobro no encontrado");
        }
        if (monto.compareTo(disponible) > 0) {
            return new ResultadoReembolso(false, "El monto supera lo cobrado");
        }
        reembolsablePorExterna.put(referenciaExterna, disponible.subtract(monto));
        log.info("[pasarela simulada] Reembolso de S/ {} sobre {}", monto, referenciaExterna);
        return new ResultadoReembolso(true, null);
    }

    @Override
    public ResultadoConsulta consultar(String referenciaIntento) {
        return porIntento.getOrDefault(referenciaIntento,
                new ResultadoConsulta(ResultadoConsulta.Estado.NO_ENCONTRADO, null, null, null, null));
    }

    private static ResultadoConsulta evaluar(SolicitudCobro solicitud, String dato) {
        boolean billetera = solicitud.metodo() == MetodoPago.YAPE || solicitud.metodo() == MetodoPago.PLIN;
        // Código de aprobación vencido o inventado: en la simulación, 000000
        if (billetera && "000000".equals(solicitud.codigoAprobacion())) {
            return new ResultadoConsulta(ResultadoConsulta.Estado.RECHAZADO, null, null, null,
                    "El código de aprobación no es válido o ya venció. Genera uno nuevo en tu app (simulado)");
        }
        boolean rechazado = billetera ? dato.endsWith("0000") : dato.contains("rechaz");
        if (rechazado) {
            return new ResultadoConsulta(ResultadoConsulta.Estado.RECHAZADO, null, null, null,
                    "Fondos insuficientes (simulado)");
        }
        boolean tarjeta = solicitud.metodo() == MetodoPago.TARJETA || solicitud.metodo() == MetodoPago.CMR;
        Matcher cuatro = ULTIMOS_CUATRO.matcher(dato);
        String ultimos = tarjeta ? (cuatro.find() ? cuatro.group(1) : "4242") : null;
        String marca = solicitud.metodo() == MetodoPago.TARJETA ? "VISA" : solicitud.metodo().name();
        return new ResultadoConsulta(ResultadoConsulta.Estado.APROBADO,
                "SIM-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase(),
                marca, ultimos, null);
    }

    private static String datoDePago(SolicitudCobro solicitud) {
        String dato = solicitud.tokenTarjeta() != null ? solicitud.tokenTarjeta() : solicitud.telefonoBilletera();
        return dato == null ? "" : dato;
    }

    private static ResultadoCobro aResultadoCobro(ResultadoConsulta consulta) {
        return new ResultadoCobro(consulta.estado() == ResultadoConsulta.Estado.APROBADO,
                consulta.referenciaExterna(), consulta.marcaTarjeta(), consulta.ultimosDigitos(),
                consulta.motivoRechazo());
    }
}
