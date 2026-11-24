package com.totospizza.scheduler;

import java.util.function.IntSupplier;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import com.totospizza.service.pago.PagoService;
import com.totospizza.service.pedido.PedidoEstadoService;
import com.totospizza.service.seguridad.EmpleadoService;


@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.jobs", name = "habilitados", havingValue = "true", matchIfMissing = true)
public class TareasProgramadas {

    private final PedidoEstadoService pedidoEstadoService;
    private final PagoService pagoService;
    private final EmpleadoService empleadoService;

    /** Cancela pedidos que nunca se pagaron y devuelve sus masas al stock web. */
    @Scheduled(fixedDelayString = "${app.jobs.expiracion-pedidos-ms:60000}", initialDelayString = "${app.jobs.espera-inicial-ms:30000}")
    public void expirarPedidosSinPago() {
        ejecutar("pedidos sin pago cancelados", pedidoEstadoService::expirarPendientesDePago);
    }

    /** Pedidos para recoger que superaron el plazo de espera en el mostrador. */
    @Scheduled(fixedDelayString = "${app.jobs.no-recogidos-ms:60000}", initialDelayString = "${app.jobs.espera-inicial-ms:30000}")
    public void marcarNoRecogidos() {
        ejecutar("pedidos marcados como no recogidos", pedidoEstadoService::marcarNoRecogidos);
    }

    /** Resuelve los cobros que quedaron sin respuesta de la pasarela. */
    @Scheduled(fixedDelayString = "${app.jobs.conciliacion-pagos-ms:60000}", initialDelayString = "${app.jobs.espera-inicial-ms:30000}")
    public void conciliarPagos() {
        ejecutar("pagos conciliados", pagoService::conciliarPendientes);
    }

    /** Inicia y termina los turnos del personal según su horario. Los finalizados cuentan para el pago base. */
    @Scheduled(fixedDelayString = "${app.jobs.turnos-ms:60000}", initialDelayString = "${app.jobs.espera-inicial-ms:30000}")
    public void actualizarTurnos() {
        ejecutar("turnos actualizados", empleadoService::actualizarTurnos);
    }

    private void ejecutar(String descripcion, IntSupplier tarea) {
        try {
            int cantidad = tarea.getAsInt();
            if (cantidad > 0) {
                log.info("{}: {}", descripcion, cantidad);
            }
        } catch (RuntimeException e) {
            log.error("Falló la tarea \"{}\"", descripcion, e);
        }
    }
}
