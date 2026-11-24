import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type {
  AjusteInventarioRequest,
  AsignarHorarioRequest,
  CambiarDisponibilidadRequest,
  CambiarEstadoPedidoRequest,
  CanalInventario,
  ConteoResponse,
  EmpleadoRequest,
  EmpleadoResponse,
  EstadoEmpleado,
  FiltroEmpleados,
  FiltroFinanzas,
  FiltroPedidos,
  FinanzasResponse,
  IngredienteRequest,
  IngredienteResponse,
  InventarioIngredienteResponse,
  MetodoPagoHabilitadoRequest,
  MetodoPagoHabilitadoResponse,
  MovimientoFinancieroRequest,
  MovimientoFinancieroResponse,
  PaginaParams,
  PageResponse,
  PagoMotorizadoResponse,
  PagoResponse,
  ParametroSistemaRequest,
  ParametroSistemaResponse,
  PedidoResponse,
  PedidoResumenResponse,
  PerfilNegocioRequest,
  PerfilNegocioResponse,
  ProductoDetalleResponse,
  ProductoRequest,
  ProductoResumenResponse,
  PromocionRequest,
  PromocionResponse,
  ReembolsoRequest,
  RegistrarPagoMotorizadoRequest,
  ResenaResponse,
  ResumenAdminResponse,
  ResumenEmpleadosResponse,
  SucursalRequest,
  SucursalResponse,
  TipoMasaRequest,
  TipoMasaResponse,
  TurnoResponse,
} from '../../models/api';
import { ApiClient } from './api-client';

@Injectable({ providedIn: 'root' })
export class AdminApi {
  private readonly api = inject(ApiClient);

  // ---- Resumen y finanzas ----
  resumen(sucursalId?: number): Observable<ResumenAdminResponse> {
    return this.api.get('/admin/finanzas/resumen', { params: { sucursalId } });
  }

  reporteFinanzas(filtro: FiltroFinanzas = {}): Observable<FinanzasResponse> {
    return this.api.get('/admin/finanzas/reporte', { params: filtro });
  }

  movimientos(filtro: FiltroFinanzas & PaginaParams = {}): Observable<PageResponse<MovimientoFinancieroResponse>> {
    return this.api.get('/admin/finanzas/movimientos', { params: filtro });
  }

  registrarMovimiento(cuerpo: MovimientoFinancieroRequest): Observable<MovimientoFinancieroResponse> {
    return this.api.post('/admin/finanzas/movimientos', cuerpo);
  }

  liquidarMotorizado(cuerpo: RegistrarPagoMotorizadoRequest): Observable<PagoMotorizadoResponse> {
    return this.api.post('/admin/finanzas/pagos-motorizado', cuerpo);
  }

  pagosPendientes(paginacion: PaginaParams = {}): Observable<PageResponse<PagoMotorizadoResponse>> {
    return this.api.get('/admin/finanzas/pagos-motorizado/pendientes', { params: paginacion });
  }

  marcarPagoPagado(id: number): Observable<PagoMotorizadoResponse> {
    return this.api.post(`/admin/finanzas/pagos-motorizado/${id}/pagar`);
  }

  conciliarPagos(): Observable<ConteoResponse> {
    return this.api.post('/admin/finanzas/pagos/conciliar');
  }

  // ---- Pedidos ----
  pedidos(filtro: FiltroPedidos = {}): Observable<PageResponse<PedidoResumenResponse>> {
    return this.api.get('/admin/pedidos', { params: filtro });
  }

  pedido(id: number): Observable<PedidoResponse> {
    return this.api.get(`/admin/pedidos/${id}`);
  }

  cambiarEstadoPedido(id: number, cuerpo: CambiarEstadoPedidoRequest): Observable<PedidoResponse> {
    return this.api.patch(`/admin/pedidos/${id}/estado`, cuerpo);
  }

  cancelarPedido(id: number, motivo?: string): Observable<PedidoResponse> {
    return this.api.post(`/admin/pedidos/${id}/cancelar`, { motivo });
  }

  reembolsar(id: number, cuerpo: ReembolsoRequest): Observable<PagoResponse> {
    return this.api.post(`/admin/pedidos/${id}/reembolso`, cuerpo);
  }

  // ---- Productos ----
  productos(paginacion: PaginaParams = {}): Observable<PageResponse<ProductoResumenResponse>> {
    return this.api.get('/admin/productos', { params: paginacion });
  }

  producto(id: number): Observable<ProductoDetalleResponse> {
    return this.api.get(`/admin/productos/${id}`);
  }

  crearProducto(cuerpo: ProductoRequest): Observable<ProductoDetalleResponse> {
    return this.api.post('/admin/productos', cuerpo);
  }

  actualizarProducto(id: number, cuerpo: ProductoRequest): Observable<ProductoDetalleResponse> {
    return this.api.put(`/admin/productos/${id}`, cuerpo);
  }

  disponibilidadProducto(id: number, cuerpo: CambiarDisponibilidadRequest): Observable<ProductoDetalleResponse> {
    return this.api.patch(`/admin/productos/${id}/disponibilidad`, cuerpo);
  }

  // ---- Ingredientes, tipos de masa ----
  ingredientes(): Observable<readonly IngredienteResponse[]> {
    return this.api.get('/admin/ingredientes');
  }

  crearIngrediente(cuerpo: IngredienteRequest): Observable<IngredienteResponse> {
    return this.api.post('/admin/ingredientes', cuerpo);
  }

  actualizarIngrediente(id: number, cuerpo: IngredienteRequest): Observable<IngredienteResponse> {
    return this.api.put(`/admin/ingredientes/${id}`, cuerpo);
  }

  disponibilidadIngrediente(id: number, cuerpo: CambiarDisponibilidadRequest): Observable<IngredienteResponse> {
    return this.api.patch(`/admin/ingredientes/${id}/disponibilidad`, cuerpo);
  }

  tiposMasa(): Observable<readonly TipoMasaResponse[]> {
    return this.api.get('/admin/tipos-masa');
  }

  crearTipoMasa(cuerpo: TipoMasaRequest): Observable<TipoMasaResponse> {
    return this.api.post('/admin/tipos-masa', cuerpo);
  }

  actualizarTipoMasa(id: number, cuerpo: TipoMasaRequest): Observable<TipoMasaResponse> {
    return this.api.put(`/admin/tipos-masa/${id}`, cuerpo);
  }

  activarTipoMasa(id: number, activa: boolean): Observable<TipoMasaResponse> {
    return this.api.patch(`/admin/tipos-masa/${id}/activa`, { disponible: activa });
  }

  // ---- Promociones ----
  promociones(): Observable<readonly PromocionResponse[]> {
    return this.api.get('/admin/promociones');
  }

  promocionesEnPerdida(): Observable<readonly PromocionResponse[]> {
    return this.api.get('/admin/promociones/en-perdida');
  }

  crearPromocion(cuerpo: PromocionRequest): Observable<PromocionResponse> {
    return this.api.post('/admin/promociones', cuerpo);
  }

  actualizarPromocion(id: number, cuerpo: PromocionRequest): Observable<PromocionResponse> {
    return this.api.put(`/admin/promociones/${id}`, cuerpo);
  }

  activarPromocion(id: number, activa: boolean): Observable<PromocionResponse> {
    return this.api.patch(`/admin/promociones/${id}/activa`, { disponible: activa });
  }

  // ---- Inventario ----
  inventario(sucursalId: number, canal: CanalInventario): Observable<readonly InventarioIngredienteResponse[]> {
    return this.api.get('/admin/inventario', { params: { sucursalId, canal } });
  }

  stockBajo(sucursalId: number, canal: CanalInventario): Observable<readonly InventarioIngredienteResponse[]> {
    return this.api.get('/admin/inventario/stock-bajo', { params: { sucursalId, canal } });
  }

  contarStockBajo(sucursalId?: number): Observable<ConteoResponse> {
    return this.api.get('/admin/inventario/stock-bajo/conteo', { params: { sucursalId } });
  }

  ajustarInventario(id: number, cuerpo: AjusteInventarioRequest): Observable<InventarioIngredienteResponse> {
    return this.api.post(`/admin/inventario/${id}/ajustes`, cuerpo);
  }

  // ---- Empleados ----
  empleados(filtro: FiltroEmpleados = {}): Observable<PageResponse<EmpleadoResponse>> {
    return this.api.get('/admin/empleados', { params: filtro });
  }

  resumenEmpleados(sucursalId: number): Observable<ResumenEmpleadosResponse> {
    return this.api.get('/admin/empleados/resumen', { params: { sucursalId } });
  }

  empleado(id: number): Observable<EmpleadoResponse> {
    return this.api.get(`/admin/empleados/${id}`);
  }

  crearEmpleado(cuerpo: EmpleadoRequest): Observable<EmpleadoResponse> {
    return this.api.post('/admin/empleados', cuerpo);
  }

  actualizarEmpleado(id: number, cuerpo: EmpleadoRequest): Observable<EmpleadoResponse> {
    return this.api.put(`/admin/empleados/${id}`, cuerpo);
  }

  cambiarEstadoEmpleado(id: number, estado: EstadoEmpleado): Observable<EmpleadoResponse> {
    return this.api.patch(`/admin/empleados/${id}/estado`, { estado });
  }

  asignarHorario(id: number, cuerpo: AsignarHorarioRequest): Observable<TurnoResponse> {
    return this.api.post(`/admin/empleados/${id}/turnos`, cuerpo);
  }

  turnos(id: number, desde: string, hasta: string): Observable<readonly TurnoResponse[]> {
    return this.api.get(`/admin/empleados/${id}/turnos`, { params: { desde, hasta } });
  }

  // ---- Sucursales ----
  sucursales(): Observable<readonly SucursalResponse[]> {
    return this.api.get('/admin/sucursales');
  }

  sucursal(id: number): Observable<SucursalResponse> {
    return this.api.get(`/admin/sucursales/${id}`);
  }

  crearSucursal(cuerpo: SucursalRequest): Observable<SucursalResponse> {
    return this.api.post('/admin/sucursales', cuerpo);
  }

  actualizarSucursal(id: number, cuerpo: SucursalRequest): Observable<SucursalResponse> {
    return this.api.put(`/admin/sucursales/${id}`, cuerpo);
  }

  activarSucursal(id: number, activa: boolean): Observable<SucursalResponse> {
    return this.api.patch(`/admin/sucursales/${id}/activa`, { disponible: activa });
  }

  // ---- Reseñas ----
  resenas(paginacion: PaginaParams = {}): Observable<PageResponse<ResenaResponse>> {
    return this.api.get('/admin/resenas', { params: paginacion });
  }

  destacarResena(id: number, destacada: boolean): Observable<ResenaResponse> {
    return this.api.patch(`/admin/resenas/${id}/destacada`, { disponible: destacada });
  }

  ocultarResena(id: number, visible: boolean): Observable<ResenaResponse> {
    return this.api.patch(`/admin/resenas/${id}/visible`, { disponible: visible });
  }

  // ---- Configuración ----
  perfilNegocio(): Observable<PerfilNegocioResponse> {
    return this.api.get('/admin/configuracion/perfil');
  }

  actualizarPerfilNegocio(cuerpo: PerfilNegocioRequest): Observable<PerfilNegocioResponse> {
    return this.api.put('/admin/configuracion/perfil', cuerpo);
  }

  parametros(): Observable<readonly ParametroSistemaResponse[]> {
    return this.api.get('/admin/configuracion/parametros');
  }

  actualizarParametro(clave: string, cuerpo: ParametroSistemaRequest): Observable<ParametroSistemaResponse> {
    return this.api.put(`/admin/configuracion/parametros/${encodeURIComponent(clave)}`, cuerpo);
  }

  metodosPagoAdmin(): Observable<readonly MetodoPagoHabilitadoResponse[]> {
    return this.api.get('/admin/configuracion/metodos-pago');
  }

  actualizarMetodoPago(cuerpo: MetodoPagoHabilitadoRequest): Observable<MetodoPagoHabilitadoResponse> {
    return this.api.put('/admin/configuracion/metodos-pago', cuerpo);
  }
}
