// Enumeraciones del backend (com.totospizza.model.enums). Los valores coinciden exactamente con el JSON.

export type Rol = 'ADMINISTRADOR' | 'CLIENTE' | 'PIZZERO' | 'DESPACHADOR' | 'MOTORIZADO';
export type TipoDocumento = 'DNI' | 'CE' | 'PASAPORTE';
export type EstadoEmpleado = 'ACTIVO' | 'EN_TURNO' | 'DISPONIBLE' | 'INACTIVO' | 'CON_LICENCIA';
export type EstadoTurno = 'PROGRAMADO' | 'EN_CURSO' | 'FINALIZADO';
export type EstadoPedido =
  | 'PENDIENTE_PAGO'
  | 'CONFIRMADO'
  | 'EN_PREPARACION'
  | 'EN_HORNO'
  | 'LISTO'
  | 'EN_CAMINO'
  | 'ENTREGADO'
  | 'CANCELADO'
  | 'NO_RECOGIDO';
export type EstadoPago = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'REEMBOLSADO';
export type EstadoPagoPersonal = 'PENDIENTE' | 'PAGADO';
export type EstadoEntrega = 'SIN_ASIGNAR' | 'ASIGNADA' | 'EN_CAMINO' | 'ENTREGADA' | 'FALLIDA';
export type TipoEntrega = 'DELIVERY' | 'RECOJO';
export type MetodoPago = 'TARJETA' | 'YAPE' | 'PLIN' | 'CMR';
export type TipoPromocion = 'COMBO' | 'DOS_POR_UNO' | 'DESCUENTO' | 'OFERTA_FLASH';
export type ColorPromocion = 'ROJO' | 'VERDE' | 'BLANCO';
export type TipoIngrediente = 'QUESO' | 'SALSA' | 'CARNE' | 'OTRO';
export type UnidadMedida = 'KILOGRAMO' | 'GRAMO' | 'LITRO' | 'MILILITRO' | 'UNIDAD';
export type CanalInventario = 'ONLINE' | 'FISICO';
export type TipoMovimientoInventario = 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'MERMA';
export type TipoMovimientoFinanciero = 'INGRESO' | 'EGRESO';
export type TipoNotificacion =
  | 'PEDIDO_NUEVO'
  | 'PEDIDO_LISTO'
  | 'ENTREGA_ASIGNADA'
  | 'STOCK_BAJO'
  | 'ALERTA_OFERTA_FLASH'
  | 'SISTEMA';
export type TipoParametro = 'TEXTO' | 'NUMERO' | 'BOOLEANO';
export type DiaSemana = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

/** Fecha y hora ISO-8601 en UTC (java.time.Instant). */
export type Instante = string;
/** Fecha ISO `YYYY-MM-DD` (java.time.LocalDate). */
export type Fecha = string;
/** Hora ISO `HH:mm:ss` (java.time.LocalTime). */
export type Hora = string;
