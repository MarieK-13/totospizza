-- Entrega que el motorizado no pudo completar: motivo y hora (el pedido vuelve al mostrador).
alter table entregas add column motivo_fallo varchar(200);
alter table entregas add column fallida_en timestamptz;

-- Un turno al que el empleado no asistió se cancela y no cuenta para el pago base.
alter table turnos drop constraint ck_turnos_estado;
alter table turnos add constraint ck_turnos_estado
    check (estado in ('PROGRAMADO', 'EN_CURSO', 'FINALIZADO', 'CANCELADO'));

-- Avisos al cliente cuando sale su pedido y cuando una entrega falla.
alter table notificaciones drop constraint ck_notificaciones_tipo;
alter table notificaciones add constraint ck_notificaciones_tipo
    check (tipo in ('PEDIDO_NUEVO', 'PEDIDO_LISTO', 'ENTREGA_ASIGNADA', 'STOCK_BAJO', 'ALERTA_OFERTA_FLASH', 'SISTEMA',
                    'PEDIDO_EN_CAMINO', 'ENTREGA_FALLIDA'));
