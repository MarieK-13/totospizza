import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type {
  ActualizarItemCarritoRequest,
  ActualizarPerfilRequest,
  AgregarProductoRequest,
  CancelarPedidoRequest,
  CarritoResponse,
  CheckoutRequest,
  CheckoutResponse,
  DireccionClienteRequest,
  DireccionClienteResponse,
  PaginaParams,
  PageResponse,
  PedidoResponse,
  PedidoResumenResponse,
  PerfilResponse,
  PizzaPersonalizadaRequest,
  PizzaPersonalizadaResponse,
  ResenaRequest,
  ResenaResponse,
  SeguimientoResponse,
} from '../../models/api';
import { ApiClient, type OpcionesPeticion } from './api-client';

/** /api/v1/cliente: requiere rol CLIENTE. */
@Injectable({ providedIn: 'root' })
export class ClienteApi {
  private readonly api = inject(ApiClient);

  // ---- Carrito ----
  carrito(): Observable<CarritoResponse> {
    return this.api.get('/cliente/carrito');
  }

  agregarAlCarrito(cuerpo: AgregarProductoRequest, opciones?: OpcionesPeticion): Observable<CarritoResponse> {
    return this.api.post('/cliente/carrito/items', cuerpo, opciones);
  }

  actualizarItem(itemId: number, cuerpo: ActualizarItemCarritoRequest): Observable<CarritoResponse> {
    return this.api.put(`/cliente/carrito/items/${itemId}`, cuerpo);
  }

  quitarItem(itemId: number): Observable<CarritoResponse> {
    return this.api.delete(`/cliente/carrito/items/${itemId}`);
  }

  vaciarCarrito(): Observable<CarritoResponse> {
    return this.api.delete('/cliente/carrito');
  }

  // ---- Pedidos ----
  checkout(cuerpo: CheckoutRequest): Observable<CheckoutResponse> {
    return this.api.post('/cliente/pedidos', cuerpo);
  }

  misPedidos(paginacion: PaginaParams = {}): Observable<PageResponse<PedidoResumenResponse>> {
    return this.api.get('/cliente/pedidos', { params: paginacion });
  }

  pedido(numero: string): Observable<PedidoResponse> {
    return this.api.get(`/cliente/pedidos/${encodeURIComponent(numero)}`);
  }

  seguimiento(numero: string): Observable<SeguimientoResponse> {
    return this.api.get(`/cliente/pedidos/${encodeURIComponent(numero)}/seguimiento`);
  }

  cancelarPedido(numero: string, cuerpo: CancelarPedidoRequest = {}): Observable<PedidoResponse> {
    return this.api.post(`/cliente/pedidos/${encodeURIComponent(numero)}/cancelar`, cuerpo);
  }

  // ---- Perfil y direcciones ----
  perfil(): Observable<PerfilResponse> {
    return this.api.get('/cliente/perfil');
  }

  actualizarPerfil(cuerpo: ActualizarPerfilRequest): Observable<PerfilResponse> {
    return this.api.put('/cliente/perfil', cuerpo);
  }

  direcciones(): Observable<readonly DireccionClienteResponse[]> {
    return this.api.get('/cliente/direcciones');
  }

  agregarDireccion(cuerpo: DireccionClienteRequest): Observable<DireccionClienteResponse> {
    return this.api.post('/cliente/direcciones', cuerpo);
  }

  actualizarDireccion(id: number, cuerpo: DireccionClienteRequest): Observable<DireccionClienteResponse> {
    return this.api.put(`/cliente/direcciones/${id}`, cuerpo);
  }

  eliminarDireccion(id: number): Observable<void> {
    return this.api.delete(`/cliente/direcciones/${id}`);
  }

  // ---- Pizzas personalizadas ----
  pizzasPersonalizadas(): Observable<readonly PizzaPersonalizadaResponse[]> {
    return this.api.get('/cliente/pizzas-personalizadas');
  }

  pizzaPersonalizada(id: number): Observable<PizzaPersonalizadaResponse> {
    return this.api.get(`/cliente/pizzas-personalizadas/${id}`);
  }

  guardarPizzaPersonalizada(cuerpo: PizzaPersonalizadaRequest): Observable<PizzaPersonalizadaResponse> {
    return this.api.post('/cliente/pizzas-personalizadas', cuerpo);
  }

  // ---- Reseñas ----
  crearResena(cuerpo: ResenaRequest): Observable<ResenaResponse> {
    return this.api.post('/cliente/resenas', cuerpo);
  }
}
