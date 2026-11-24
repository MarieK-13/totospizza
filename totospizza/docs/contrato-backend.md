# Contrato del backend — Toto's Pizza

> Documento único del backend (reemplaza a `contrato-backend-api.md` y `contrato-backend-catalogo-admin.md`). Las secciones 3 a 8 se **generan leyendo el código real** (controladores, DTOs, enums y excepciones) el 24/11/2026; las secciones 1, 2, 9 y 10 están escritas a mano. Si cambia el backend, se regenera. Lo que no aparece aquí **no existe** en el backend: no inventarlo en el frontend.

## 1. Convenciones

- **Stack:** Spring Boot 4.2 (Java 21), Spring Security con JWT (resource server), JPA + Hibernate (`ddl-auto=validate`), Flyway, MapStruct (`unmappedTargetPolicy = ERROR`), Lombok, PostgreSQL. Todo corre **en local** (el profesor pidió nada en la nube).
- **Base:** `http://localhost:8080/api/v1`. JSON en camelCase en español. Fechas/instantes ISO‑8601; dinero `BigDecimal` con 2 decimales (soles).
- **Capas:** `controller/{admin,auth,cliente,cocina,despacho,reparto,publico,comun}` → `service` (interfaz) + `service/impl` → `repository` → `model/entity`. DTOs en `dto/request/*` y `dto/response/*` (records), mappers MapStruct en `mapper/*`. Reglas aparte en `rules/policy`.
- **Autenticación:** `Authorization: Bearer <accessToken>`. Access 15 min, refresh 7 días; **el refresh rota en cada uso** (`POST /auth/refresh`). Sin sesión: `/publico/**`, `/auth/**`, `/actuator/health` y `GET /uploads/**`; excepto `/auth/logout` y `/auth/cambiar-contrasena`, que piden sesión.
- **Roles:** `CLIENTE`, `PIZZERO`, `DESPACHADOR`, `MOTORIZADO`, `ADMINISTRADOR`. Prefijos: `/cliente/**`, `/cocina/**`, `/despacho/**`, `/reparto/**`, `/admin/**` (con `@PreAuthorize`), `/notificaciones/**` (cualquier sesión).
- **CORS:** `app.cors.origenes-permitidos` (en local `http://localhost:4200`). Métodos GET, POST, PUT, PATCH, DELETE, OPTIONS.
- **Paginación:** `pagina` (0‑based) y `tamano` (el servidor lo acota a 1–100). Respuesta `PageResponse<T>`: `contenido, pagina, tamano, totalElementos, totalPaginas, primera, ultima`.
- **Errores:** siempre `ApiError` (`fecha, estado, codigo, mensaje, ruta, errores[]` con `campo`/`mensaje`). El frontend decide por `codigo`. `ReglaNegocioException` → **422**, `ConflictoException` → **409**, `RecursoNoEncontradoException` → **404**, `NoAutenticadoException` → **401**, `AccesoDenegadoException` → **403**; validaciones y cuerpos mal formados → **400** con `errores[]`; archivo muy grande → **413**.
- **Perfiles:** `dev` por defecto (`db/migration` + `db/dev`, con datos demo); `prod` solo `db/migration`.
- **Variables de entorno** (en `.vscode/launch.json`): `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`, `DB_MIGRATION_USERNAME`, `DB_MIGRATION_PASSWORD`, `JWT_SECRET`/`APP_JWT_SECRET` (≥ 32 caracteres), `MAIL_HABILITADO`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_HOST`, `MAIL_PORT`, `APP_FRONTEND_URL`, `APP_ARCHIVOS_DIR`.
- **Usuarios demo** (`db/dev/V100`, contraseña `Toto1234`): `admin@`, `pizzero@`, `despachador@`, `motorizado@`, `cliente@totospizza.pe`.

## 2. Reglas de negocio

**Seguridad**
- Registro (`201`) y login devuelven `TokenResponse`. `olvido-contrasena` responde `202` siempre igual (no revela si el correo existe). Token de recuperación de un solo uso, vence en 1 hora.
- Correo: `NotificadorCorreoSmtp` (activo con `MAIL_HABILITADO=true`, Gmail con contraseña de aplicación, envío `@Async`, HTML con botón) o `NotificadorCorreoSimulado` (por defecto: escribe en el log el enlace `{APP_FRONTEND_URL}/restablecer-contrasena?token=…`).
- La contraseña nueva (recuperar o cambiar) no puede ser igual a la actual → `CONTRASENA_REPETIDA`. Cambiar o restablecer revoca todos los refresh tokens.
- Cuenta inactiva → `CUENTA_INACTIVA`; credenciales malas → `CREDENCIALES_INVALIDAS`; correo/documento repetidos → `CORREO_DUPLICADO` / `DOCUMENTO_DUPLICADO`.

**Catálogo**
- `/publico/menu` devuelve solo productos `disponible = true`; filtros `categoria` (slug), `etiqueta` (slug) y `q`.
- Los **alérgenos son etiquetas** (`etiquetas[]`), por convención `Contiene …` / `Sin …`; el resto son rasgos (`Vegetariana`, `Picante`). `esFiltro` = se ofrece como chip de filtro.
- El detalle (`/publico/menu/{slug}` y `/admin/productos/{id}`) trae `requiereTamano`, `precios[]` por tamaño, `tiposMasa[]` (con `recargo`), `adicionales[]` (ingredientes extra con `precioExtra`) e `ingredientes[]` (lo que lleva el producto, tabla `producto_ingredientes`).
- Administración: categorías (CRUD; no se eliminan si tienen productos → `CATEGORIA_CON_PRODUCTOS`), etiquetas (CRUD; al borrar, los productos la pierden), tamaños (CRUD sin borrar; inactivo = no se ofrece al armar pizzas, `TAMANO_NO_DISPONIBLE`), tipos de masa, ingredientes, productos, promociones. Nombres repetidos → `CATEGORIA_DUPLICADA`, `ETIQUETA_DUPLICADA`, `TAMANO_DUPLICADO`. Los slugs se generan solos (`SlugUtil`).
- **Imágenes:** `POST /admin/imagenes` (multipart `archivo`, `carpeta` = PRODUCTOS/PROMOCIONES/SUCURSALES/NEGOCIO). Solo JPG/PNG/WebP comprobado por los primeros bytes, máx. 2 MB, nombre UUID. Se guardan en `backend/uploads/` (ignorada en git) y se sirven en `GET /uploads/**`. La respuesta `{url}` es la URL completa que se guarda en `imagenUrl`/`logoUrl`.

**Carrito (CLIENTE)**
- Las pizzas (`requiereTamano`) exigen `tamanoId` y `tipoMasaId` (`OPCIONES_REQUERIDAS`); un producto sin tamaño rechaza esas opciones (`OPCIONES_NO_APLICAN`).
- `cantidad` 1–20; `notas` ≤ 250; hasta 10 adicionales distintos por ítem.

**Checkout y pago (`POST /cliente/pedidos`)**
- Pago **obligatorio y online** (sin contra entrega, cupones ni puntos). Valida método → crea `PENDIENTE_PAGO` → cobra → `CONFIRMADO`. Pago rechazado (`PAGO_RECHAZADO`) cancela el pedido y libera stock.
- Pasarela **simulada** (`PasarelaPagoSimulada`, intercambiable por una real vía la interfaz `PasarelaPago`). Tarjeta: `tokenTarjeta`. Yape/Plin: `telefonoBilletera` + `codigoAprobacion` de 6 dígitos (sin código → `DATOS_PAGO_INCOMPLETOS`; `000000` simula un código vencido).
- Sucursal activa (`SUCURSAL_INACTIVA`) y abierta (`SUCURSAL_CERRADA`, soporta cruzar medianoche). `DELIVERY` exige dirección (`DIRECCION_REQUERIDA`) dentro de cobertura (`FUERA_DE_COBERTURA`).
- **Stock web exclusivo:** reserva masas del inventario canal `ONLINE` (`409 STOCK_WEB_AGOTADO`); un job cancela los impagos a los `minutos_expiracion_pago` y devuelve las masas.
- **Montos:** `total = max(subtotal − descuento, 0) + costoDelivery`; delivery gratis si `RECOJO` o `subtotal ≥ envio_gratis_desde`; si no, costo de la zona o `costo_delivery_base`. HALF_UP a 2 decimales.
- Número del pedido `PZ-<n>` desde la secuencia `seq_numero_pedido` (V102). Tiempo estimado: `minutos_preparacion` (+ `ceil(distanciaKm × minutos_por_km)` en delivery).

**Estados del pedido**
- `PENDIENTE_PAGO → CONFIRMADO | CANCELADO`; `CONFIRMADO → EN_PREPARACION | EN_HORNO | CANCELADO`; `EN_PREPARACION → EN_HORNO`; `EN_HORNO → LISTO`; `LISTO → EN_CAMINO` (delivery) | `ENTREGADO` / `NO_RECOGIDO` (recojo); `EN_CAMINO → ENTREGADO`. Otra → `TRANSICION_INVALIDA` (`PedidoEstadoPolicy`).
- Cuentan como venta: `CONFIRMADO … ENTREGADO, NO_RECOGIDO`. Cancelar solo desde `PENDIENTE_PAGO`/`CONFIRMADO`, con reembolso automático. Recojo no retirado → `NO_RECOGIDO` tras `minutos_vencimiento_recojo`.

**Seguimiento:** 4 etapas, `minutosRestantes` hasta `entregaEstimada`; `codigoEntrega` (PIN) solo en delivery en curso; `garantiaAplicada` si se pasa de `minutos_tolerancia_garantia`.

**Operación**
- Cocina: `iniciar-preparacion` → `enviar-al-horno` → `marcar-listo`; el tablero muestra solo qué preparar.
- Despacho: `pedidos-listos` (con cliente, teléfono, dirección, instrucciones e ítems); delivery → `asignar-motorizado`; recojo → `entregar-en-mostrador`.
- Reparto: `entregas` (con ítems) → `iniciar-ruta` → `confirmar` con el PIN del cliente (5 fallos → `PIN_BLOQUEADO`).

**Administración y finanzas**
- Pago a motorizado = tarifa por turno finalizado + bono por entrega; se liquida por periodo (`PERIODO_LIQUIDADO`) y luego se marca pagado.
- Ranking: más vendidos por ventas; menos vendidos parte del menú completo (incluye los de 0 ventas).
- Promociones: CRUD y `activa`; `/en-perdida` lista ofertas flash que dan pérdida. Públicas: solo vigentes.
- Listado admin de pedidos trae `nombreCliente` y `telefonoCliente`; empleados traen `nombres`, `apellidos` y documento para poder editarlos.

## 3. Endpoints

### AdminCategoria — `/api/v1/admin/categorias` — acceso: **ADMINISTRADOR**

| Método | Ruta | Query | Cuerpo | Respuesta | HTTP |
|---|---|---|---|---|---|
| GET | `/api/v1/admin/categorias` | — | — | `List<CategoriaResponse>` | 200 |
| POST | `/api/v1/admin/categorias` | — | `CategoriaRequest` | `CategoriaResponse` | 201 |
| PUT | `/api/v1/admin/categorias/{id}` | — | `CategoriaRequest` | `CategoriaResponse` | 200 |
| PATCH | `/api/v1/admin/categorias/{id}/activa` | — | `CambiarDisponibilidadRequest` | `CategoriaResponse` | 200 |
| DELETE | `/api/v1/admin/categorias/{id}` | — | — | `void` | 204 |

### AdminConfiguracion — `/api/v1/admin/configuracion` — acceso: **ADMINISTRADOR**

| Método | Ruta | Query | Cuerpo | Respuesta | HTTP |
|---|---|---|---|---|---|
| GET | `/api/v1/admin/configuracion/perfil` | — | — | `PerfilNegocioResponse` | 200 |
| PUT | `/api/v1/admin/configuracion/perfil` | — | `PerfilNegocioRequest` | `PerfilNegocioResponse` | 200 |
| GET | `/api/v1/admin/configuracion/parametros` | — | — | `List<ParametroSistemaResponse>` | 200 |
| PUT | `/api/v1/admin/configuracion/parametros/{clave}` | — | `ParametroSistemaRequest` | `ParametroSistemaResponse` | 200 |
| GET | `/api/v1/admin/configuracion/metodos-pago` | — | — | `List<MetodoPagoHabilitadoResponse>` | 200 |
| PUT | `/api/v1/admin/configuracion/metodos-pago` | — | `MetodoPagoHabilitadoRequest` | `MetodoPagoHabilitadoResponse` | 200 |

### AdminEmpleado — `/api/v1/admin/empleados` — acceso: **ADMINISTRADOR**

| Método | Ruta | Query | Cuerpo | Respuesta | HTTP |
|---|---|---|---|---|---|
| GET | `/api/v1/admin/empleados` | sucursalId:Long (opcional); rol:Rol (opcional); estado:EstadoEmpleado (opcional); q:String (opcional); pagina:int (opcional, por defecto 0); tamano:int (opcional, por defecto 20) | — | `PageResponse<EmpleadoResponse>` | 200 |
| GET | `/api/v1/admin/empleados/resumen` | sucursalId:Long (obligatorio) | — | `ResumenEmpleadosResponse` | 200 |
| GET | `/api/v1/admin/empleados/{id}` | — | — | `EmpleadoResponse` | 200 |
| POST | `/api/v1/admin/empleados` | — | `EmpleadoRequest` | `EmpleadoResponse` | 201 |
| PUT | `/api/v1/admin/empleados/{id}` | — | `EmpleadoRequest` | `EmpleadoResponse` | 200 |
| PATCH | `/api/v1/admin/empleados/{id}/estado` | — | `CambiarEstadoEmpleadoRequest` | `EmpleadoResponse` | 200 |
| POST | `/api/v1/admin/empleados/{id}/turnos` | — | `AsignarHorarioRequest` | `TurnoResponse` | 201 |
| GET | `/api/v1/admin/empleados/{id}/turnos` | desde:LocalDate (obligatorio); hasta:LocalDate (obligatorio) | — | `List<TurnoResponse>` | 200 |

### AdminEtiqueta — `/api/v1/admin/etiquetas` — acceso: **ADMINISTRADOR**

| Método | Ruta | Query | Cuerpo | Respuesta | HTTP |
|---|---|---|---|---|---|
| GET | `/api/v1/admin/etiquetas` | — | — | `List<EtiquetaResponse>` | 200 |
| POST | `/api/v1/admin/etiquetas` | — | `EtiquetaRequest` | `EtiquetaResponse` | 201 |
| PUT | `/api/v1/admin/etiquetas/{id}` | — | `EtiquetaRequest` | `EtiquetaResponse` | 200 |
| DELETE | `/api/v1/admin/etiquetas/{id}` | — | — | `void` | 204 |

### AdminFinanzas — `/api/v1/admin/finanzas` — acceso: **ADMINISTRADOR**

| Método | Ruta | Query | Cuerpo | Respuesta | HTTP |
|---|---|---|---|---|---|
| GET | `/api/v1/admin/finanzas/resumen` | sucursalId:Long (opcional) | — | `ResumenAdminResponse` | 200 |
| GET | `/api/v1/admin/finanzas/reporte` | sucursalId:Long (opcional); desde:LocalDate (opcional); hasta:LocalDate (opcional) | — | `FinanzasResponse` | 200 |
| GET | `/api/v1/admin/finanzas/movimientos` | sucursalId:Long (opcional); desde:LocalDate (opcional); hasta:LocalDate (opcional); pagina:int (opcional, por defecto 0); tamano:int (opcional, por defecto 20) | — | `PageResponse<MovimientoFinancieroResponse>` | 200 |
| POST | `/api/v1/admin/finanzas/movimientos` | — | `MovimientoFinancieroRequest` | `MovimientoFinancieroResponse` | 201 |
| POST | `/api/v1/admin/finanzas/pagos-motorizado` | — | `RegistrarPagoMotorizadoRequest` | `PagoMotorizadoResponse` | 201 |
| GET | `/api/v1/admin/finanzas/pagos-motorizado/pendientes` | pagina:int (opcional, por defecto 0); tamano:int (opcional, por defecto 20) | — | `PageResponse<PagoMotorizadoResponse>` | 200 |
| POST | `/api/v1/admin/finanzas/pagos-motorizado/{id}/pagar` | — | — | `PagoMotorizadoResponse` | 200 |
| POST | `/api/v1/admin/finanzas/pagos/conciliar` | — | — | `ConteoResponse` | 200 |

### AdminImagen — `/api/v1/admin/imagenes` — acceso: **ADMINISTRADOR**

| Método | Ruta | Query | Cuerpo | Respuesta | HTTP |
|---|---|---|---|---|---|
| POST | `/api/v1/admin/imagenes` | carpeta:CarpetaImagen (opcional, por defecto PRODUCTOS) | multipart: `archivo` (archivo) | `ImagenResponse` | 201 |

### AdminIngrediente — `/api/v1/admin/ingredientes` — acceso: **ADMINISTRADOR**

| Método | Ruta | Query | Cuerpo | Respuesta | HTTP |
|---|---|---|---|---|---|
| GET | `/api/v1/admin/ingredientes` | — | — | `List<IngredienteResponse>` | 200 |
| POST | `/api/v1/admin/ingredientes` | — | `IngredienteRequest` | `IngredienteResponse` | 201 |
| PUT | `/api/v1/admin/ingredientes/{id}` | — | `IngredienteRequest` | `IngredienteResponse` | 200 |
| PATCH | `/api/v1/admin/ingredientes/{id}/disponibilidad` | — | `CambiarDisponibilidadRequest` | `IngredienteResponse` | 200 |

### AdminInventario — `/api/v1/admin/inventario` — acceso: **ADMINISTRADOR**

| Método | Ruta | Query | Cuerpo | Respuesta | HTTP |
|---|---|---|---|---|---|
| GET | `/api/v1/admin/inventario` | sucursalId:Long (obligatorio); canal:CanalInventario (obligatorio) | — | `List<InventarioIngredienteResponse>` | 200 |
| GET | `/api/v1/admin/inventario/stock-bajo` | sucursalId:Long (obligatorio); canal:CanalInventario (obligatorio) | — | `List<InventarioIngredienteResponse>` | 200 |
| GET | `/api/v1/admin/inventario/stock-bajo/conteo` | sucursalId:Long (opcional) | — | `ConteoResponse` | 200 |
| POST | `/api/v1/admin/inventario/{id}/ajustes` | — | `AjusteInventarioRequest` | `InventarioIngredienteResponse` | 200 |

### AdminPedido — `/api/v1/admin/pedidos` — acceso: **ADMINISTRADOR**

| Método | Ruta | Query | Cuerpo | Respuesta | HTTP |
|---|---|---|---|---|---|
| GET | `/api/v1/admin/pedidos` | sucursalId:Long (opcional); estado:EstadoPedido (opcional); desde:LocalDate (opcional); hasta:LocalDate (opcional); q:String (opcional); pagina:int (opcional, por defecto 0); tamano:int (opcional, por defecto 20) | — | `PageResponse<PedidoResumenResponse>` | 200 |
| GET | `/api/v1/admin/pedidos/{id}` | — | — | `PedidoResponse` | 200 |
| PATCH | `/api/v1/admin/pedidos/{id}/estado` | — | `CambiarEstadoPedidoRequest` | `PedidoResponse` | 200 |
| POST | `/api/v1/admin/pedidos/{id}/cancelar` | — | `CancelarPedidoRequest` | `PedidoResponse` | 200 |
| POST | `/api/v1/admin/pedidos/{id}/reembolso` | — | `ReembolsoRequest` | `PagoResponse` | 200 |

### AdminProducto — `/api/v1/admin/productos` — acceso: **ADMINISTRADOR**

| Método | Ruta | Query | Cuerpo | Respuesta | HTTP |
|---|---|---|---|---|---|
| GET | `/api/v1/admin/productos` | pagina:int (opcional, por defecto 0); tamano:int (opcional, por defecto 20) | — | `PageResponse<ProductoResumenResponse>` | 200 |
| GET | `/api/v1/admin/productos/{id}` | — | — | `ProductoDetalleResponse` | 200 |
| POST | `/api/v1/admin/productos` | — | `ProductoRequest` | `ProductoDetalleResponse` | 201 |
| PUT | `/api/v1/admin/productos/{id}` | — | `ProductoRequest` | `ProductoDetalleResponse` | 200 |
| PATCH | `/api/v1/admin/productos/{id}/disponibilidad` | — | `CambiarDisponibilidadRequest` | `ProductoDetalleResponse` | 200 |

### AdminPromocion — `/api/v1/admin/promociones` — acceso: **ADMINISTRADOR**

| Método | Ruta | Query | Cuerpo | Respuesta | HTTP |
|---|---|---|---|---|---|
| GET | `/api/v1/admin/promociones` | — | — | `List<PromocionResponse>` | 200 |
| GET | `/api/v1/admin/promociones/en-perdida` | — | — | `List<PromocionResponse>` | 200 |
| POST | `/api/v1/admin/promociones` | — | `PromocionRequest` | `PromocionResponse` | 201 |
| PUT | `/api/v1/admin/promociones/{id}` | — | `PromocionRequest` | `PromocionResponse` | 200 |
| PATCH | `/api/v1/admin/promociones/{id}/activa` | — | `CambiarDisponibilidadRequest` | `PromocionResponse` | 200 |

### AdminResena — `/api/v1/admin/resenas` — acceso: **ADMINISTRADOR**

| Método | Ruta | Query | Cuerpo | Respuesta | HTTP |
|---|---|---|---|---|---|
| GET | `/api/v1/admin/resenas` | pagina:int (opcional, por defecto 0); tamano:int (opcional, por defecto 20) | — | `PageResponse<ResenaResponse>` | 200 |
| PATCH | `/api/v1/admin/resenas/{id}/destacada` | — | `CambiarDisponibilidadRequest` | `ResenaResponse` | 200 |
| PATCH | `/api/v1/admin/resenas/{id}/visible` | — | `CambiarDisponibilidadRequest` | `ResenaResponse` | 200 |

### AdminSucursal — `/api/v1/admin/sucursales` — acceso: **ADMINISTRADOR**

| Método | Ruta | Query | Cuerpo | Respuesta | HTTP |
|---|---|---|---|---|---|
| GET | `/api/v1/admin/sucursales` | — | — | `List<SucursalResponse>` | 200 |
| GET | `/api/v1/admin/sucursales/{id}` | — | — | `SucursalResponse` | 200 |
| POST | `/api/v1/admin/sucursales` | — | `SucursalRequest` | `SucursalResponse` | 201 |
| PUT | `/api/v1/admin/sucursales/{id}` | — | `SucursalRequest` | `SucursalResponse` | 200 |
| PATCH | `/api/v1/admin/sucursales/{id}/activa` | — | `CambiarDisponibilidadRequest` | `SucursalResponse` | 200 |

### AdminTamanoPizza — `/api/v1/admin/tamanos` — acceso: **ADMINISTRADOR**

| Método | Ruta | Query | Cuerpo | Respuesta | HTTP |
|---|---|---|---|---|---|
| GET | `/api/v1/admin/tamanos` | — | — | `List<TamanoPizzaResponse>` | 200 |
| POST | `/api/v1/admin/tamanos` | — | `TamanoPizzaRequest` | `TamanoPizzaResponse` | 201 |
| PUT | `/api/v1/admin/tamanos/{id}` | — | `TamanoPizzaRequest` | `TamanoPizzaResponse` | 200 |
| PATCH | `/api/v1/admin/tamanos/{id}/activo` | — | `CambiarDisponibilidadRequest` | `TamanoPizzaResponse` | 200 |

### AdminTipoMasa — `/api/v1/admin/tipos-masa` — acceso: **ADMINISTRADOR**

| Método | Ruta | Query | Cuerpo | Respuesta | HTTP |
|---|---|---|---|---|---|
| GET | `/api/v1/admin/tipos-masa` | — | — | `List<TipoMasaResponse>` | 200 |
| POST | `/api/v1/admin/tipos-masa` | — | `TipoMasaRequest` | `TipoMasaResponse` | 201 |
| PUT | `/api/v1/admin/tipos-masa/{id}` | — | `TipoMasaRequest` | `TipoMasaResponse` | 200 |
| PATCH | `/api/v1/admin/tipos-masa/{id}/activa` | — | `CambiarDisponibilidadRequest` | `TipoMasaResponse` | 200 |

### Auth — `/api/v1/auth` — acceso: **público (sin sesión)**

| Método | Ruta | Query | Cuerpo | Respuesta | HTTP |
|---|---|---|---|---|---|
| POST | `/api/v1/auth/registro` | — | `RegistroRequest` | `TokenResponse` | 201 |
| POST | `/api/v1/auth/login` | — | `LoginRequest` | `TokenResponse` | 200 |
| POST | `/api/v1/auth/refresh` | — | `RefreshTokenRequest` | `TokenResponse` | 200 |
| POST | `/api/v1/auth/logout` _(solo isAuthenticated())_ | — | — | `void` | 204 |
| POST | `/api/v1/auth/olvido-contrasena` | — | `OlvidoContrasenaRequest` | `MensajeResponse` | 202 |
| POST | `/api/v1/auth/restablecer-contrasena` | — | `RestablecerContrasenaRequest` | `MensajeResponse` | 200 |
| POST | `/api/v1/auth/cambiar-contrasena` _(solo isAuthenticated())_ | — | `CambiarContrasenaRequest` | `void` | 204 |

### Carrito — `/api/v1/cliente/carrito` — acceso: **CLIENTE**

| Método | Ruta | Query | Cuerpo | Respuesta | HTTP |
|---|---|---|---|---|---|
| GET | `/api/v1/cliente/carrito` | — | — | `CarritoResponse` | 200 |
| POST | `/api/v1/cliente/carrito/items` | — | `AgregarProductoRequest` | `CarritoResponse` | 201 |
| PUT | `/api/v1/cliente/carrito/items/{itemId}` | — | `ActualizarItemCarritoRequest` | `CarritoResponse` | 200 |
| DELETE | `/api/v1/cliente/carrito/items/{itemId}` | — | — | `CarritoResponse` | 200 |
| DELETE | `/api/v1/cliente/carrito` | — | — | `CarritoResponse` | 200 |

### Pedido — `/api/v1/cliente/pedidos` — acceso: **CLIENTE**

| Método | Ruta | Query | Cuerpo | Respuesta | HTTP |
|---|---|---|---|---|---|
| POST | `/api/v1/cliente/pedidos` | — | `CheckoutRequest` | `CheckoutResponse` | 201 |
| GET | `/api/v1/cliente/pedidos` | pagina:int (opcional, por defecto 0); tamano:int (opcional, por defecto 20) | — | `PageResponse<PedidoResumenResponse>` | 200 |
| GET | `/api/v1/cliente/pedidos/{numero}` | — | — | `PedidoResponse` | 200 |
| GET | `/api/v1/cliente/pedidos/{numero}/seguimiento` | — | — | `SeguimientoResponse` | 200 |
| POST | `/api/v1/cliente/pedidos/{numero}/cancelar` | — | `CancelarPedidoRequest` | `PedidoResponse` | 200 |

### Perfil — `/api/v1/cliente` — acceso: **CLIENTE**

| Método | Ruta | Query | Cuerpo | Respuesta | HTTP |
|---|---|---|---|---|---|
| GET | `/api/v1/cliente/perfil` | — | — | `PerfilResponse` | 200 |
| PUT | `/api/v1/cliente/perfil` | — | `ActualizarPerfilRequest` | `PerfilResponse` | 200 |
| GET | `/api/v1/cliente/direcciones` | — | — | `List<DireccionClienteResponse>` | 200 |
| POST | `/api/v1/cliente/direcciones` | — | `DireccionClienteRequest` | `DireccionClienteResponse` | 201 |
| PUT | `/api/v1/cliente/direcciones/{id}` | — | `DireccionClienteRequest` | `DireccionClienteResponse` | 200 |
| DELETE | `/api/v1/cliente/direcciones/{id}` | — | — | `void` | 204 |

### PizzaPersonalizada — `/api/v1/cliente/pizzas-personalizadas` — acceso: **CLIENTE**

| Método | Ruta | Query | Cuerpo | Respuesta | HTTP |
|---|---|---|---|---|---|
| GET | `/api/v1/cliente/pizzas-personalizadas` | — | — | `List<PizzaPersonalizadaResponse>` | 200 |
| GET | `/api/v1/cliente/pizzas-personalizadas/{id}` | — | — | `PizzaPersonalizadaResponse` | 200 |
| POST | `/api/v1/cliente/pizzas-personalizadas` | — | `PizzaPersonalizadaRequest` | `PizzaPersonalizadaResponse` | 201 |

### Resena — `/api/v1/cliente/resenas` — acceso: **CLIENTE**

| Método | Ruta | Query | Cuerpo | Respuesta | HTTP |
|---|---|---|---|---|---|
| POST | `/api/v1/cliente/resenas` | — | `ResenaRequest` | `ResenaResponse` | 201 |

### Cocina — `/api/v1/cocina` — acceso: **PIZZERO**

| Método | Ruta | Query | Cuerpo | Respuesta | HTTP |
|---|---|---|---|---|---|
| GET | `/api/v1/cocina/tablero` | — | — | `TableroCocinaResponse` | 200 |
| POST | `/api/v1/cocina/pedidos/{id}/iniciar-preparacion` | — | — | `TableroCocinaResponse` | 200 |
| POST | `/api/v1/cocina/pedidos/{id}/enviar-al-horno` | — | — | `TableroCocinaResponse` | 200 |
| POST | `/api/v1/cocina/pedidos/{id}/marcar-listo` | — | — | `TableroCocinaResponse` | 200 |

### Notificacion — `/api/v1/notificaciones` — acceso: **isAuthenticated()**

| Método | Ruta | Query | Cuerpo | Respuesta | HTTP |
|---|---|---|---|---|---|
| GET | `/api/v1/notificaciones` | pagina:int (opcional, por defecto 0); tamano:int (opcional, por defecto 20) | — | `PageResponse<NotificacionResponse>` | 200 |
| GET | `/api/v1/notificaciones/no-leidas/conteo` | — | — | `ConteoResponse` | 200 |
| PATCH | `/api/v1/notificaciones/{id}/leida` | — | — | `void` | 204 |
| PATCH | `/api/v1/notificaciones/leidas` | — | — | `void` | 204 |

### Despacho — `/api/v1/despacho` — acceso: **DESPACHADOR**

| Método | Ruta | Query | Cuerpo | Respuesta | HTTP |
|---|---|---|---|---|---|
| GET | `/api/v1/despacho/pedidos-listos` | — | — | `List<PedidoListoResponse>` | 200 |
| GET | `/api/v1/despacho/motorizados` | — | — | `List<EmpleadoResponse>` | 200 |
| POST | `/api/v1/despacho/pedidos/{id}/asignar-motorizado` | — | `AsignarMotorizadoRequest` | `EntregaResponse` | 200 |
| POST | `/api/v1/despacho/pedidos/{id}/entregar-en-mostrador` | — | — | `PedidoListoResponse` | 200 |

### ConfiguracionPublica — `/api/v1/publico` — acceso: **público (sin sesión)**

| Método | Ruta | Query | Cuerpo | Respuesta | HTTP |
|---|---|---|---|---|---|
| GET | `/api/v1/publico/configuracion` | — | — | `ConfiguracionPublicaResponse` | 200 |
| GET | `/api/v1/publico/metodos-pago` | — | — | `List<MetodoPagoDisponibleResponse>` | 200 |

### MenuPublico — `/api/v1/publico` — acceso: **público (sin sesión)**

| Método | Ruta | Query | Cuerpo | Respuesta | HTTP |
|---|---|---|---|---|---|
| GET | `/api/v1/publico/home` | — | — | `HomeResponse` | 200 |
| GET | `/api/v1/publico/menu` | categoria:String (opcional); etiqueta:String (opcional); q:String (opcional); tamanoPizza:Long (opcional); pagina:int (opcional, por defecto 0); tamano:int (opcional, por defecto 20) | — | `PageResponse<ProductoResumenResponse>` | 200 |
| GET | `/api/v1/publico/menu/filtros` | — | — | `MenuFiltrosResponse` | 200 |
| GET | `/api/v1/publico/menu/{slug}` | — | — | `ProductoDetalleResponse` | 200 |

### PersonalizacionPublica — `/api/v1/publico/personalizacion` — acceso: **público (sin sesión)**

| Método | Ruta | Query | Cuerpo | Respuesta | HTTP |
|---|---|---|---|---|---|
| GET | `/api/v1/publico/personalizacion/opciones` | — | — | `OpcionesPersonalizacionResponse` | 200 |
| POST | `/api/v1/publico/personalizacion/cotizar` | — | `PizzaPersonalizadaRequest` | `CotizacionPizzaResponse` | 200 |

### PromocionPublica — `/api/v1/publico/promociones` — acceso: **público (sin sesión)**

| Método | Ruta | Query | Cuerpo | Respuesta | HTTP |
|---|---|---|---|---|---|
| GET | `/api/v1/publico/promociones` | — | — | `List<PromocionResponse>` | 200 |

### ResenaPublica — `/api/v1/publico` — acceso: **público (sin sesión)**

| Método | Ruta | Query | Cuerpo | Respuesta | HTTP |
|---|---|---|---|---|---|
| GET | `/api/v1/publico/resenas/destacadas` | limite:int (opcional, por defecto 6) | — | `List<ResenaResponse>` | 200 |
| GET | `/api/v1/publico/productos/{productoId}/calificacion` | — | — | `ResumenCalificacionResponse` | 200 |

### SucursalPublica — `/api/v1/publico` — acceso: **público (sin sesión)**

| Método | Ruta | Query | Cuerpo | Respuesta | HTTP |
|---|---|---|---|---|---|
| GET | `/api/v1/publico/locales` | — | — | `LocalesResponse` | 200 |
| GET | `/api/v1/publico/locales/{id}` | — | — | `SucursalResponse` | 200 |
| POST | `/api/v1/publico/cobertura` | — | `ConsultaCoberturaRequest` | `CoberturaResponse` | 200 |

### Reparto — `/api/v1/reparto` — acceso: **MOTORIZADO**

| Método | Ruta | Query | Cuerpo | Respuesta | HTTP |
|---|---|---|---|---|---|
| GET | `/api/v1/reparto/entregas` | — | — | `List<EntregaAsignadaResponse>` | 200 |
| POST | `/api/v1/reparto/entregas/{id}/iniciar-ruta` | — | — | `EntregaResponse` | 200 |
| POST | `/api/v1/reparto/entregas/{id}/confirmar` | — | `ConfirmarEntregaRequest` | `EntregaResponse` | 200 |

## 4. DTOs de entrada (request)

### request/catalogo

#### `CambiarDisponibilidadRequest` — Activa o desactiva la disponibilidad de un producto o ingrediente.

| Campo | Tipo | Validación |
|---|---|---|
| `disponible` | `Boolean` | @NotNull |

#### `CategoriaRequest` — Datos para crear o editar una categoría del menú.

| Campo | Tipo | Validación |
|---|---|---|
| `nombre` | `String` | @NotBlank @Size(max = 60) |
| `orden` | `Integer` | @Min(0) @Max(999) |
| `activa` | `boolean` |  |

#### `EtiquetaRequest` — Etiqueta de un producto, por ejemplo un alérgeno ("Contiene gluten") o un rasgo ("Vegetariana"). Con {@code esFiltro} aparece como chip para filtrar el menú.

| Campo | Tipo | Validación |
|---|---|---|
| `nombre` | `String` | @NotBlank @Size(max = 60) |
| `esFiltro` | `boolean` |  |

#### `IngredienteRequest` — Alta o edición de un ingrediente.

| Campo | Tipo | Validación |
|---|---|---|
| `nombre` | `String` | @NotBlank @Size(max = 80) |
| `tipo` | `TipoIngrediente` | @NotNull |
| `precioExtra` | `BigDecimal` | @NotNull @DecimalMin(value = "0.00") @Digits(integer = 8, fraction = 2) |
| `costoOperativoFijo` | `BigDecimal` | @DecimalMin(value = "0.00") @Digits(integer = 8, fraction = 2) |
| `disponible` | `boolean` |  |

#### `ProductoRequest` — Alta o edición de un producto del catálogo.

| Campo | Tipo | Validación |
|---|---|---|
| `categoriaId` | `Long` | @NotNull @Positive |
| `nombre` | `String` | @NotBlank @Size(max = 120) |
| `descripcion` | `String` | @Size(max = 1000) |
| `imagenUrl` | `String` | @Size(max = 500) |
| `precioBase` | `BigDecimal` | @NotNull @DecimalMin(value = "0.00") @Digits(integer = 8, fraction = 2) |
| `requiereTamano` | `boolean` |  |
| `disponible` | `boolean` |  |
| `destacado` | `boolean` |  |
| `etiquetaIds` | `Set<Long>` | @NotNull @Size(max = 10) |
| `precios` | `List<ProductoTamanoRequest>` | @NotNull @Valid @Size(max = 10) |
| `ingredienteIds` | `Set<Long>` | @Size(max = 30) |

#### `ProductoTamanoRequest` — Precio de un producto para un tamaño.

| Campo | Tipo | Validación |
|---|---|---|
| `tamanoId` | `Long` | @NotNull @Positive |
| `precio` | `BigDecimal` | @NotNull @DecimalMin(value = "0.00") @Digits(integer = 8, fraction = 2) |

#### `PromocionItemRequest` — Producto incluido en una promoción.

| Campo | Tipo | Validación |
|---|---|---|
| `productoId` | `Long` | @NotNull @Positive |
| `tamanoId` | `Long` |  |
| `cantidad` | `Integer` | @NotNull @Min(1) @Max(20) |

#### `PromocionRequest` — Alta o edición de una promoción.

| Campo | Tipo | Validación |
|---|---|---|
| `titulo` | `String` | @NotBlank @Size(max = 120) |
| `descripcion` | `String` | @Size(max = 500) |
| `tipo` | `TipoPromocion` | @NotNull |
| `etiqueta` | `String` | @Size(max = 40) |
| `precioPromocional` | `BigDecimal` | @NotNull @DecimalMin(value = "0.00") @Digits(integer = 8, fraction = 2) |
| `precioAnterior` | `BigDecimal` | @DecimalMin(value = "0.00") @Digits(integer = 8, fraction = 2) |
| `costoEstimado` | `BigDecimal` | @DecimalMin(value = "0.00") @Digits(integer = 8, fraction = 2) |
| `imagenUrl` | `String` | @Size(max = 500) |
| `colorFondo` | `ColorPromocion` | @NotNull |
| `condiciones` | `String` | @Size(max = 500) |
| `vigenteDesde` | `Instant` | @NotNull |
| `vigenteHasta` | `Instant` | @NotNull |
| `activa` | `boolean` |  |
| `orden` | `Integer` | @Min(0) |
| `items` | `List<PromocionItemRequest>` | @NotEmpty @Valid @Size(max = 20) |

#### `TamanoPizzaRequest` — Datos de un tamaño de pizza.

| Campo | Tipo | Validación |
|---|---|---|
| `nombre` | `String` | @NotBlank @Size(max = 40) |
| `diametroCm` | `Integer` | @NotNull @Min(10) @Max(80) |
| `personasMin` | `Integer` | @NotNull @Min(1) @Max(20) |
| `personasMax` | `Integer` | @NotNull @Min(1) @Max(30) |
| `precioBase` | `BigDecimal` | @NotNull @DecimalMin(value = "0.00") @Digits(integer = 8, fraction = 2) |
| `orden` | `Integer` | @Min(0) @Max(999) |
| `activo` | `boolean` |  |

#### `TipoMasaRequest` — Alta o edición de un tipo de masa.

| Campo | Tipo | Validación |
|---|---|---|
| `nombre` | `String` | @NotBlank @Size(max = 60) |
| `recargo` | `BigDecimal` | @NotNull @DecimalMin(value = "0.00") @Digits(integer = 8, fraction = 2) |
| `activa` | `boolean` |  |

### request/configuracion

#### `MetodoPagoHabilitadoRequest` — Habilita o deshabilita un método de pago.

| Campo | Tipo | Validación |
|---|---|---|
| `metodo` | `MetodoPago` | @NotNull |
| `activo` | `boolean` |  |
| `orden` | `Integer` | @Min(0) |

#### `ParametroSistemaRequest` — Nuevo valor de un parámetro del sistema

| Campo | Tipo | Validación |
|---|---|---|
| `valor` | `String` | @NotBlank @Size(max = 250) |

#### `PerfilNegocioRequest` — Datos del negocio mostrados en el sitio.

| Campo | Tipo | Validación |
|---|---|---|
| `nombreComercial` | `String` | @NotBlank @Size(max = 120) |
| `razonSocial` | `String` | @Size(max = 160) |
| `ruc` | `String` | @Pattern(regexp = "^\\d{11}$", message = "El RUC debe tener 11 dígitos") |
| `logoUrl` | `String` | @Size(max = 500) |
| `correoContacto` | `String` | @Email @Size(max = 120) |
| `telefonoContacto` | `String` | @Pattern(regexp = "^9\\d{8}$", message = "El teléfono debe tener 9 dígitos y empezar con 9") |
| `direccionFiscal` | `String` | @Size(max = 200) |
| `instagramUrl` | `String` | @Size(max = 200) |
| `facebookUrl` | `String` | @Size(max = 200) |
| `whatsapp` | `String` | @Pattern(regexp = "^9\\d{8}$", message = "El WhatsApp debe tener 9 dígitos y empezar con 9") |

### request/finanzas

#### `MovimientoFinancieroRequest` — Registro manual de un ingreso o egreso.

| Campo | Tipo | Validación |
|---|---|---|
| `sucursalId` | `Long` | @NotNull @Positive |
| `tipo` | `TipoMovimientoFinanciero` | @NotNull |
| `concepto` | `String` | @NotBlank @Size(max = 200) |
| `monto` | `BigDecimal` | @NotNull @DecimalMin(value = "0.00") @Digits(integer = 8, fraction = 2) |
| `ocurridoEn` | `Instant` | @NotNull |

#### `RegistrarPagoMotorizadoRequest` — Genera la liquidación de un motorizado para un periodo.

| Campo | Tipo | Validación |
|---|---|---|
| `empleadoId` | `Long` | @NotNull @Positive |
| `periodoDesde` | `LocalDate` | @NotNull |
| `periodoHasta` | `LocalDate` | @NotNull |

### request/operacion

#### `AjusteInventarioRequest` — Movimiento manual de inventario de un ingrediente.

| Campo | Tipo | Validación |
|---|---|---|
| `tipo` | `TipoMovimientoInventario` | @NotNull |
| `cantidad` | `BigDecimal` | @NotNull @DecimalMin(value = "0.01") @Digits(integer = 8, fraction = 2) |
| `motivo` | `String` | @NotBlank @Size(max = 250) |

#### `AsignarMotorizadoRequest` — El despachador asigna un motorizado a un pedido listo.

| Campo | Tipo | Validación |
|---|---|---|
| `motorizadoId` | `Long` | @NotNull @Positive |

#### `CambiarEstadoPedidoRequest` — Cambio de estado operativo de un pedido (cocina o despacho).

| Campo | Tipo | Validación |
|---|---|---|
| `estado` | `EstadoPedido` | @NotNull |
| `comentario` | `String` | @Size(max = 250) |

#### `ConfirmarEntregaRequest` — El motorizado confirma la entrega con el código de 4 dígitos del cliente.

| Campo | Tipo | Validación |
|---|---|---|
| `codigoPin` | `String` | @NotBlank @Pattern(regexp = "^\\d{4}$", message = "El código debe tener 4 dígitos") |

### request/pago

#### `PagoRequest` — Datos de pago. Nunca se envía el número de tarjeta ni el CVV: solo el token de la pasarela. Yape y Plin se pagan con el celular y el código de aprobación de 6 dígitos que genera la app.

| Campo | Tipo | Validación |
|---|---|---|
| `metodo` | `MetodoPago` | @NotNull |
| `tokenTarjeta` | `String` | @Size(max = 200) |
| `telefonoBilletera` | `String` | @Pattern(regexp = "^9\\d{8}$", message = "El celular debe tener 9 dígitos y empezar con 9") |
| `codigoAprobacion` | `String` | @Pattern(regexp = "^\\d{6}$", message = "El código de aprobación debe tener 6 dígitos") |

#### `ReembolsoRequest` — Reembolso total o parcial de un pago (administrador).

| Campo | Tipo | Validación |
|---|---|---|
| `monto` | `BigDecimal` | @NotNull @DecimalMin(value = "0.00") @Digits(integer = 8, fraction = 2) |
| `motivo` | `String` | @NotBlank @Size(max = 250) |

### request/pedido

#### `ActualizarItemCarritoRequest` — Modifica cantidad o notas de un ítem del carrito.

| Campo | Tipo | Validación |
|---|---|---|
| `cantidad` | `Integer` | @NotNull @Min(1) @Max(20) |
| `notas` | `String` | @Size(max = 250) |

#### `AdicionalRequest` — Ingrediente adicional agregado a un ítem.

| Campo | Tipo | Validación |
|---|---|---|
| `ingredienteId` | `Long` | @NotNull @Positive |
| `cantidad` | `Integer` | @NotNull @Min(1) @Max(5) |

#### `AgregarProductoRequest` — Agrega un ítem al carrito.

| Campo | Tipo | Validación |
|---|---|---|
| `productoId` | `Long` |  |
| `pizzaPersonalizadaId` | `Long` |  |
| `promocionId` | `Long` |  |
| `tamanoId` | `Long` |  |
| `tipoMasaId` | `Long` |  |
| `cantidad` | `Integer` | @NotNull @Min(1) @Max(20) |
| `notas` | `String` | @Size(max = 250) |
| `adicionales` | `List<AdicionalRequest>` | @Valid @Size(max = 10) |

#### `CancelarPedidoRequest` — Cancelación de un pedido.

| Campo | Tipo | Validación |
|---|---|---|
| `motivo` | `String` | @NotBlank @Size(max = 250) |

#### `CheckoutRequest` — Confirma el carrito y paga online. El pago es obligatorio: no hay pago contra entrega.

| Campo | Tipo | Validación |
|---|---|---|
| `tipoEntrega` | `TipoEntrega` | @NotNull |
| `sucursalId` | `Long` | @NotNull @Positive |
| `direccionEntrega` | `DireccionRequest` | @Valid |
| `instrucciones` | `String` | @Size(max = 250) |
| `pago` | `PagoRequest` | @NotNull @Valid |

### request/personalizacion

#### `PizzaPersonalizadaRequest` — Pizza armada por el cliente paso a paso. Se usa para cotizar y para guardar.

| Campo | Tipo | Validación |
|---|---|---|
| `nombre` | `String` | @Size(max = 80) |
| `tamanoId` | `Long` | @NotNull @Positive |
| `tipoMasaId` | `Long` | @NotNull @Positive |
| `quesoIds` | `List<Long>` | @NotEmpty @Size(max = 2, message = "Máximo 2 quesos") |
| `salsaIds` | `List<Long>` | @NotNull @Size(max = 2, message = "Máximo 2 salsas") |
| `ingredienteIds` | `List<Long>` | @NotNull @Size(max = 2, message = "Máximo 2 ingredientes") |

### request/resena

#### `CalificacionProductoRequest` — Calificación de un producto dentro de una reseña.

| Campo | Tipo | Validación |
|---|---|---|
| `productoId` | `Long` | @NotNull @Positive |
| `estrellas` | `Integer` | @NotNull @Min(1) @Max(5) |

#### `ResenaRequest` — Reseña de un pedido entregado.

| Campo | Tipo | Validación |
|---|---|---|
| `pedidoId` | `Long` | @NotNull @Positive |
| `calificacion` | `Integer` | @NotNull @Min(1) @Max(5) |
| `comentario` | `String` | @Size(max = 500) |
| `calificaciones` | `List<CalificacionProductoRequest>` | @Valid @Size(max = 20) |

### request/seguridad

#### `ActualizarPerfilRequest` — Datos editables del perfil del cliente.

| Campo | Tipo | Validación |
|---|---|---|
| `nombres` | `String` | @NotBlank @Size(max = 80) |
| `apellidos` | `String` | @NotBlank @Size(max = 80) |
| `telefono` | `String` | @NotBlank @Pattern(regexp = "^9\\d{8}$", message = "El celular debe tener 9 dígitos y empezar con 9") |
| `fechaNacimiento` | `LocalDate` | @NotNull @Past |
| `avatarUrl` | `String` | @Size(max = 500) |

#### `AsignarHorarioRequest` — Asignación de un turno a un empleado.

| Campo | Tipo | Validación |
|---|---|---|
| `fecha` | `LocalDate` | @NotNull @FutureOrPresent |
| `horaInicio` | `LocalTime` | @NotNull |
| `horaFin` | `LocalTime` | @NotNull |
| `puesto` | `String` | @Size(max = 60) |
| `sucursalId` | `Long` | @NotNull @Positive |

#### `CambiarContrasenaRequest` — Cambio de contraseña de un usuario autenticado.

| Campo | Tipo | Validación |
|---|---|---|
| `contrasenaActual` | `String` | @NotBlank |
| `nuevaContrasena` | `String` | @NotBlank @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).{8,72}$", message = "La contraseña debe tener entre 8 y 72 caracteres, con letras y números") |
| `confirmarContrasena` | `String` | @NotBlank |

#### `CambiarEstadoEmpleadoRequest` — Cambio de estado de un empleado.

| Campo | Tipo | Validación |
|---|---|---|
| `estado` | `EstadoEmpleado` | @NotNull |

#### `DireccionClienteRequest` — Dirección guardada en la libreta del cliente.

| Campo | Tipo | Validación |
|---|---|---|
| `etiqueta` | `String` | @NotBlank @Size(max = 40) |
| `direccion` | `DireccionRequest` | @NotNull @Valid |
| `favorita` | `boolean` |  |

#### `DireccionRequest` — Dirección con coordenadas, reutilizada por checkout, sucursales y libreta del cliente.

| Campo | Tipo | Validación |
|---|---|---|
| `direccion` | `String` | @NotBlank @Size(max = 200) |
| `referencia` | `String` | @Size(max = 200) |
| `distrito` | `String` | @NotBlank @Size(max = 80) |
| `latitud` | `BigDecimal` | @NotNull @DecimalMin(value = "-90.0") @DecimalMax(value = "90.0") |
| `longitud` | `BigDecimal` | @NotNull @DecimalMin(value = "-180.0") @DecimalMax(value = "180.0") |

#### `EmpleadoRequest` — Alta o edición de un empleado (solo administrador).

| Campo | Tipo | Validación |
|---|---|---|
| `nombres` | `String` | @NotBlank @Size(max = 80) |
| `apellidos` | `String` | @NotBlank @Size(max = 80) |
| `tipoDocumento` | `TipoDocumento` | @NotNull |
| `numeroDocumento` | `String` | @NotBlank @Pattern(regexp = "^[A-Za-z0-9]{8,20}$", message = "El documento debe tener entre 8 y 20 caracteres alfanuméricos") |
| `telefono` | `String` | @NotBlank @Pattern(regexp = "^9\\d{8}$", message = "El celular debe tener 9 dígitos y empezar con 9") |
| `correo` | `String` | @NotBlank @Email(message = "Correo electrónico inválido") @Size(max = 120) |
| `contrasenaInicial` | `String` | @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).{8,72}$", message = "La contraseña debe tener entre 8 y 72 caracteres, con letras y números") |
| `rol` | `Rol` | @NotNull |
| `sucursalId` | `Long` | @NotNull @Positive |
| `horaInicio` | `LocalTime` | @NotNull |
| `horaFin` | `LocalTime` | @NotNull |
| `fechaIngreso` | `LocalDate` | @NotNull @PastOrPresent |
| `pagoBaseTurno` | `BigDecimal` | @DecimalMin(value = "0.00") @Digits(integer = 8, fraction = 2) |
| `bonoPorEntrega` | `BigDecimal` | @DecimalMin(value = "0.00") @Digits(integer = 8, fraction = 2) |

#### `LoginRequest` — Credenciales de inicio de sesión.

| Campo | Tipo | Validación |
|---|---|---|
| `correo` | `String` | @NotBlank @Email(message = "Correo electrónico inválido") @Size(max = 120) |
| `contrasena` | `String` | @NotBlank |

#### `OlvidoContrasenaRequest` — Solicitud de enlace para recuperar la contraseña.

| Campo | Tipo | Validación |
|---|---|---|
| `correo` | `String` | @NotBlank @Email(message = "Correo electrónico inválido") @Size(max = 120) |

#### `RefreshTokenRequest` — Solicitud para renovar el access token.

| Campo | Tipo | Validación |
|---|---|---|
| `refreshToken` | `String` | @NotBlank |

#### `RegistroRequest` — Datos para registrar un nuevo cliente.

| Campo | Tipo | Validación |
|---|---|---|
| `nombres` | `String` | @NotBlank @Size(max = 80) |
| `apellidos` | `String` | @NotBlank @Size(max = 80) |
| `tipoDocumento` | `TipoDocumento` | @NotNull |
| `numeroDocumento` | `String` | @NotBlank @Pattern(regexp = "^[A-Za-z0-9]{8,20}$", message = "El documento debe tener entre 8 y 20 caracteres alfanuméricos") |
| `fechaNacimiento` | `LocalDate` | @NotNull @Past(message = "La fecha de nacimiento debe ser pasada") |
| `telefono` | `String` | @NotBlank @Pattern(regexp = "^9\\d{8}$", message = "El celular debe tener 9 dígitos y empezar con 9") |
| `correo` | `String` | @NotBlank @Email(message = "Correo electrónico inválido") @Size(max = 120) |
| `contrasena` | `String` | @NotBlank @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).{8,72}$", message = "La contraseña debe tener entre 8 y 72 caracteres, con letras y números") |
| `confirmarContrasena` | `String` | @NotBlank |
| `aceptaTerminos` | `boolean` | @AssertTrue(message = "Debes aceptar los términos y condiciones") |

#### `RestablecerContrasenaRequest` — Restablece la contraseña con el token recibido por correo.

| Campo | Tipo | Validación |
|---|---|---|
| `token` | `String` | @NotBlank |
| `nuevaContrasena` | `String` | @NotBlank @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).{8,72}$", message = "La contraseña debe tener entre 8 y 72 caracteres, con letras y números") |
| `confirmarContrasena` | `String` | @NotBlank |

### request/sucursal

#### `ConsultaCoberturaRequest` — Consulta si una ubicación está dentro de la zona de reparto.

| Campo | Tipo | Validación |
|---|---|---|
| `latitud` | `BigDecimal` | @NotNull @DecimalMin(value = "-90.0") @DecimalMax(value = "90.0") |
| `longitud` | `BigDecimal` | @NotNull @DecimalMin(value = "-180.0") @DecimalMax(value = "180.0") |
| `sucursalId` | `Long` |  |

#### `HorarioSucursalRequest` — Horario de atención de un día.

| Campo | Tipo | Validación |
|---|---|---|
| `diaSemana` | `DayOfWeek` | @NotNull |
| `horaApertura` | `LocalTime` |  |
| `horaCierre` | `LocalTime` |  |
| `cerrado` | `boolean` |  |

#### `SucursalRequest` — Alta o edición de una sucursal.

| Campo | Tipo | Validación |
|---|---|---|
| `nombre` | `String` | @NotBlank @Size(max = 100) |
| `direccion` | `DireccionRequest` | @NotNull @Valid |
| `telefono` | `String` | @NotBlank @Pattern(regexp = "^9\\d{8}$", message = "El celular debe tener 9 dígitos y empezar con 9") |
| `imagenUrl` | `String` | @Size(max = 500) |
| `activa` | `boolean` |  |
| `radioCoberturaKm` | `BigDecimal` | @NotNull @DecimalMin(value = "0.5") @DecimalMax(value = "10.0") @Digits(integer = 2, fraction = 1) |
| `horarios` | `List<HorarioSucursalRequest>` | @NotNull @Valid @Size(max = 7) |
| `zonas` | `List<ZonaRepartoRequest>` | @NotNull @Valid @Size(max = 10) |

#### `ZonaRepartoRequest` — Zona de reparto por rango de distancia.

| Campo | Tipo | Validación |
|---|---|---|
| `nombre` | `String` | @NotBlank @Size(max = 60) |
| `distanciaDesdeKm` | `BigDecimal` | @NotNull @DecimalMin(value = "0.0") @Digits(integer = 2, fraction = 2) |
| `distanciaHastaKm` | `BigDecimal` | @NotNull @DecimalMin(value = "0.0") @Digits(integer = 2, fraction = 2) |
| `costoEnvio` | `BigDecimal` | @NotNull @DecimalMin(value = "0.00") @Digits(integer = 8, fraction = 2) |
| `activa` | `boolean` |  |

## 5. DTOs de salida (response)

### response/archivo

#### `ImagenResponse` — Imagen recién subida: la URL ya se puede guardar en {@code imagenUrl}.

| Campo | Tipo | Validación |
|---|---|---|
| `url` | `String` |  |

### response/catalogo

#### `CategoriaResponse` — Categoría del menú.

| Campo | Tipo | Validación |
|---|---|---|
| `id` | `Long` |  |
| `nombre` | `String` |  |
| `slug` | `String` |  |
| `orden` | `Integer` |  |
| `activa` | `boolean` |  |

#### `EtiquetaResponse` — Etiqueta visual: alérgeno o característica dietética.

| Campo | Tipo | Validación |
|---|---|---|
| `id` | `Long` |  |
| `nombre` | `String` |  |
| `slug` | `String` |  |
| `esFiltro` | `boolean` |  |

#### `HomeResponse` — Contenido de la página de inicio en una sola llamada.

| Campo | Tipo | Validación |
|---|---|---|
| `promociones` | `List<PromocionResponse>` |  |
| `destacados` | `List<ProductoResumenResponse>` |  |
| `resenas` | `List<ResenaResponse>` |  |
| `negocio` | `ConfiguracionPublicaResponse` |  |

#### `IngredienteResponse` — Ingrediente disponible para personalizar o agregar.

| Campo | Tipo | Validación |
|---|---|---|
| `id` | `Long` |  |
| `nombre` | `String` |  |
| `tipo` | `TipoIngrediente` |  |
| `precioExtra` | `BigDecimal` |  |
| `disponible` | `boolean` |  |

#### `MenuFiltrosResponse` — Opciones de filtrado del menú.

| Campo | Tipo | Validación |
|---|---|---|
| `categorias` | `List<CategoriaResponse>` |  |
| `etiquetas` | `List<EtiquetaResponse>` |  |
| `tamanos` | `List<TamanoPizzaResponse>` | Tamaños de pizza con diámetro y personas, para el filtro "para cuántas personas". |

#### `PrecioTamanoResponse` — Precio de un producto por tamaño.

| Campo | Tipo | Validación |
|---|---|---|
| `tamanoId` | `Long` |  |
| `tamanoNombre` | `String` |  |
| `precio` | `BigDecimal` |  |

#### `ProductoDetalleResponse` — Detalle completo de un producto.

| Campo | Tipo | Validación |
|---|---|---|
| `id` | `Long` |  |
| `categoria` | `CategoriaResponse` |  |
| `nombre` | `String` |  |
| `slug` | `String` |  |
| `descripcion` | `String` |  |
| `imagenUrl` | `String` |  |
| `precioBase` | `BigDecimal` |  |
| `requiereTamano` | `boolean` |  |
| `disponible` | `boolean` |  |
| `destacado` | `boolean` |  |
| `calificacionPromedio` | `BigDecimal` |  |
| `totalResenas` | `Integer` |  |
| `etiquetas` | `List<EtiquetaResponse>` |  |
| `precios` | `List<PrecioTamanoResponse>` |  |
| `tiposMasa` | `List<TipoMasaResponse>` |  |
| `adicionales` | `List<IngredienteResponse>` |  |
| `ingredientes` | `List<IngredienteResponse>` |  |

#### `ProductoResumenResponse` — Tarjeta de producto para listados.

| Campo | Tipo | Validación |
|---|---|---|
| `id` | `Long` |  |
| `nombre` | `String` |  |
| `slug` | `String` |  |
| `descripcion` | `String` |  |
| `imagenUrl` | `String` |  |
| `precioDesde` | `BigDecimal` |  |
| `categoria` | `String` |  |
| `disponible` | `boolean` |  |
| `destacado` | `boolean` |  |
| `calificacionPromedio` | `BigDecimal` |  |
| `totalResenas` | `Integer` |  |
| `etiquetas` | `List<EtiquetaResponse>` |  |

#### `PromocionItemResponse` — Producto incluido en una promoción.

| Campo | Tipo | Validación |
|---|---|---|
| `productoId` | `Long` |  |
| `productoNombre` | `String` |  |
| `tamanoNombre` | `String` |  |
| `cantidad` | `Integer` |  |

#### `PromocionResponse` — Promoción vigente para el cliente. No expone el costo estimado.

| Campo | Tipo | Validación |
|---|---|---|
| `id` | `Long` |  |
| `titulo` | `String` |  |
| `descripcion` | `String` |  |
| `tipo` | `TipoPromocion` |  |
| `etiqueta` | `String` |  |
| `precioPromocional` | `BigDecimal` |  |
| `precioAnterior` | `BigDecimal` |  |
| `imagenUrl` | `String` |  |
| `colorFondo` | `ColorPromocion` |  |
| `condiciones` | `String` |  |
| `vigenteHasta` | `Instant` |  |
| `items` | `List<PromocionItemResponse>` |  |

#### `TamanoPizzaResponse` — Tamaño de pizza.

| Campo | Tipo | Validación |
|---|---|---|
| `id` | `Long` |  |
| `nombre` | `String` |  |
| `diametroCm` | `Integer` |  |
| `personasMin` | `Integer` |  |
| `personasMax` | `Integer` |  |
| `precioBase` | `BigDecimal` |  |
| `orden` | `Integer` |  |
| `activo` | `boolean` |  |

#### `TipoMasaResponse` — Tipo de masa.

| Campo | Tipo | Validación |
|---|---|---|
| `id` | `Long` |  |
| `nombre` | `String` |  |
| `recargo` | `BigDecimal` |  |

### response/configuracion

#### `ConfiguracionPublicaResponse` — Datos públicos para el sitio: contacto, envío y pagos.

| Campo | Tipo | Validación |
|---|---|---|
| `nombreComercial` | `String` |  |
| `logoUrl` | `String` |  |
| `whatsapp` | `String` |  |
| `instagramUrl` | `String` |  |
| `facebookUrl` | `String` |  |
| `envioGratisDesde` | `BigDecimal` |  |
| `costoDeliveryBase` | `BigDecimal` |  |
| `radioCoberturaKm` | `BigDecimal` |  |
| `metodosPago` | `List<MetodoPagoDisponibleResponse>` |  |

#### `MetodoPagoHabilitadoResponse` — Método de pago y su estado.

| Campo | Tipo | Validación |
|---|---|---|
| `metodo` | `MetodoPago` |  |
| `etiqueta` | `String` |  |
| `activo` | `boolean` |  |
| `orden` | `Integer` |  |

#### `ParametroSistemaResponse` — Parámetro del sistema.

| Campo | Tipo | Validación |
|---|---|---|
| `clave` | `String` |  |
| `valor` | `String` |  |
| `tipo` | `TipoParametro` |  |
| `descripcion` | `String` |  |

#### `PerfilNegocioResponse` — Datos del negocio.

| Campo | Tipo | Validación |
|---|---|---|
| `nombreComercial` | `String` |  |
| `razonSocial` | `String` |  |
| `ruc` | `String` |  |
| `logoUrl` | `String` |  |
| `correoContacto` | `String` |  |
| `telefonoContacto` | `String` |  |
| `direccionFiscal` | `String` |  |
| `instagramUrl` | `String` |  |
| `facebookUrl` | `String` |  |
| `whatsapp` | `String` |  |

### response/finanzas

#### `FinanzasResponse` — Reporte financiero de un periodo.

| Campo | Tipo | Validación |
|---|---|---|
| `desde` | `LocalDate` |  |
| `hasta` | `LocalDate` |  |
| `ingresos` | `BigDecimal` |  |
| `egresos` | `BigDecimal` |  |
| `ganancia` | `BigDecimal` |  |
| `deudaMotorizados` | `BigDecimal` |  |
| `ventasDiarias` | `List<VentaDiariaResponse>` |  |
| `ventasPorMetodo` | `List<VentaPorMetodoPagoResponse>` |  |
| `ranking` | `RankingProductosResponse` |  |
| `pagosMotorizados` | `List<PagoMotorizadoResponse>` |  |

#### `MovimientoFinancieroResponse` — Movimiento financiero.

| Campo | Tipo | Validación |
|---|---|---|
| `id` | `Long` |  |
| `tipo` | `TipoMovimientoFinanciero` |  |
| `concepto` | `String` |  |
| `monto` | `BigDecimal` |  |
| `ocurridoEn` | `Instant` |  |
| `numeroPedido` | `String` |  |

#### `PagoMotorizadoResponse` — Liquidación de un motorizado.

| Campo | Tipo | Validación |
|---|---|---|
| `id` | `Long` |  |
| `empleadoId` | `Long` |  |
| `motorizadoNombre` | `String` |  |
| `periodoDesde` | `LocalDate` |  |
| `periodoHasta` | `LocalDate` |  |
| `totalEntregas` | `Integer` |  |
| `montoBase` | `BigDecimal` |  |
| `montoBonos` | `BigDecimal` |  |
| `montoTotal` | `BigDecimal` |  |
| `estado` | `EstadoPagoPersonal` |  |
| `pagadoEn` | `Instant` |  |

#### `PedidosPorEstadoResponse` — Pedidos agrupados por estado.

| Campo | Tipo | Validación |
|---|---|---|
| `estado` | `EstadoPedido` |  |
| `cantidad` | `long` |  |

#### `ProductoVendidoResponse` — Producto con sus ventas.

| Campo | Tipo | Validación |
|---|---|---|
| `nombre` | `String` |  |
| `cantidad` | `long` |  |
| `ingresos` | `BigDecimal` |  |

#### `RankingProductosResponse` — Ranking para decidir qué actualizar en el menú.

| Campo | Tipo | Validación |
|---|---|---|
| `masVendidos` | `List<ProductoVendidoResponse>` |  |
| `menosVendidos` | `List<ProductoVendidoResponse>` |  |

#### `ResumenAdminResponse` — Indicadores del dashboard del administrador.

| Campo | Tipo | Validación |
|---|---|---|
| `gananciaSemanal` | `BigDecimal` |  |
| `gananciaMensual` | `BigDecimal` |  |
| `gananciaAnual` | `BigDecimal` |  |
| `ventasHoy` | `BigDecimal` |  |
| `pedidosHoy` | `long` |  |
| `deudaMotorizados` | `BigDecimal` |  |
| `alertasStockBajo` | `long` |  |
| `pedidosPorEstado` | `List<PedidosPorEstadoResponse>` |  |

#### `VentaDiariaResponse` — Ventas de un día.

| Campo | Tipo | Validación |
|---|---|---|
| `fecha` | `LocalDate` |  |
| `total` | `BigDecimal` |  |
| `pedidos` | `long` |  |

#### `VentaPorMetodoPagoResponse` — Ventas por método de pago.

| Campo | Tipo | Validación |
|---|---|---|
| `metodo` | `MetodoPago` |  |
| `total` | `BigDecimal` |  |
| `transacciones` | `long` |  |

### response/operacion

#### `EntregaAsignadaResponse` — Entrega vista por el motorizado. No incluye el código de entrega.

| Campo | Tipo | Validación |
|---|---|---|
| `entregaId` | `Long` |  |
| `pedidoId` | `Long` |  |
| `numeroPedido` | `String` |  |
| `nombreCliente` | `String` |  |
| `telefonoCliente` | `String` |  |
| `direccion` | `DireccionResponse` |  |
| `instrucciones` | `String` |  |
| `estado` | `EstadoEntrega` |  |
| `distanciaKm` | `BigDecimal` |  |
| `asignadaEn` | `Instant` |  |
| `items` | `List<ItemCocinaResponse>` |  |

#### `EntregaResponse` — Entrega de un pedido.

| Campo | Tipo | Validación |
|---|---|---|
| `id` | `Long` |  |
| `pedidoId` | `Long` |  |
| `numeroPedido` | `String` |  |
| `estado` | `EstadoEntrega` |  |
| `motorizadoNombre` | `String` |  |
| `asignadaEn` | `Instant` |  |
| `recogidaEn` | `Instant` |  |
| `entregadaEn` | `Instant` |  |
| `distanciaKm` | `BigDecimal` |  |

#### `InventarioIngredienteResponse` — Stock de un ingrediente por canal.

| Campo | Tipo | Validación |
|---|---|---|
| `id` | `Long` |  |
| `ingredienteId` | `Long` |  |
| `ingredienteNombre` | `String` |  |
| `canal` | `CanalInventario` |  |
| `stockActual` | `BigDecimal` |  |
| `stockMinimo` | `BigDecimal` |  |
| `unidad` | `UnidadMedida` |  |
| `stockBajo` | `boolean` |  |

#### `ItemCocinaResponse` — Línea de un ticket de cocina: solo lo que hay que preparar, sin precios.

| Campo | Tipo | Validación |
|---|---|---|
| `nombre` | `String` |  |
| `descripcion` | `String` |  |
| `cantidad` | `Integer` |  |
| `notas` | `String` |  |
| `adicionales` | `List<String>` |  |

#### `NotificacionResponse` — Notificación para un usuario.

| Campo | Tipo | Validación |
|---|---|---|
| `id` | `Long` |  |
| `tipo` | `TipoNotificacion` |  |
| `titulo` | `String` |  |
| `mensaje` | `String` |  |
| `leida` | `boolean` |  |
| `creadoEn` | `Instant` |  |

#### `PedidoListoResponse` — Pedido listo en el mostrador del despachador.

| Campo | Tipo | Validación |
|---|---|---|
| `pedidoId` | `Long` |  |
| `numero` | `String` |  |
| `tipoEntrega` | `TipoEntrega` |  |
| `nombreCliente` | `String` |  |
| `telefonoCliente` | `String` |  |
| `direccion` | `DireccionResponse` |  |
| `instrucciones` | `String` |  |
| `cantidadItems` | `Integer` |  |
| `items` | `List<ItemCocinaResponse>` |  |
| `listoEn` | `Instant` |  |
| `estadoEntrega` | `EstadoEntrega` |  |
| `motorizadoNombre` | `String` |  |
| `vencimientoRecojo` | `Instant` |  |

#### `TableroCocinaResponse` — Tablero del pizzero.

| Campo | Tipo | Validación |
|---|---|---|
| `porPreparar` | `List<TicketCocinaResponse>` |  |
| `enHorno` | `List<TicketCocinaResponse>` |  |

#### `TicketCocinaResponse` — Ticket de la pantalla de cocina.

| Campo | Tipo | Validación |
|---|---|---|
| `pedidoId` | `Long` |  |
| `numero` | `String` |  |
| `estado` | `EstadoPedido` |  |
| `tipoEntrega` | `TipoEntrega` |  |
| `confirmadoEn` | `Instant` |  |
| `minutosTranscurridos` | `Integer` |  |
| `instrucciones` | `String` |  |
| `items` | `List<ItemCocinaResponse>` |  |

#### `TurnoResponse` — Turno de un empleado.

| Campo | Tipo | Validación |
|---|---|---|
| `id` | `Long` |  |
| `empleadoId` | `Long` |  |
| `empleadoNombre` | `String` |  |
| `fecha` | `LocalDate` |  |
| `horaInicio` | `LocalTime` |  |
| `horaFin` | `LocalTime` |  |
| `estado` | `EstadoTurno` |  |
| `puesto` | `String` |  |

### response/pago

#### `MetodoPagoDisponibleResponse` — Método de pago ofrecido en el checkout.

| Campo | Tipo | Validación |
|---|---|---|
| `metodo` | `MetodoPago` |  |
| `etiqueta` | `String` |  |
| `orden` | `Integer` |  |

#### `PagoResponse` — Pago de un pedido

| Campo | Tipo | Validación |
|---|---|---|
| `id` | `Long` |  |
| `metodo` | `MetodoPago` |  |
| `estado` | `EstadoPago` |  |
| `monto` | `BigDecimal` |  |
| `marcaTarjeta` | `String` |  |
| `ultimosDigitos` | `String` |  |
| `pagadoEn` | `Instant` |  |
| `montoReembolsado` | `BigDecimal` |  |

### response/pedido

#### `AdicionalResponse` — Adicional de un ítem.

| Campo | Tipo | Validación |
|---|---|---|
| `ingredienteId` | `Long` |  |
| `nombre` | `String` |  |
| `cantidad` | `Integer` |  |
| `precioUnitario` | `BigDecimal` |  |

#### `CarritoResponse` — Carrito activo del cliente.

| Campo | Tipo | Validación |
|---|---|---|
| `id` | `Long` |  |
| `items` | `List<ItemCarritoResponse>` |  |
| `totalItems` | `Integer` |  |
| `montos` | `ResumenMontosResponse` |  |
| `montosReferenciales` | `boolean` |  |
| `avisoMontos` | `String` |  |

#### `CheckoutResponse` — Resultado de confirmar el pedido.

| Campo | Tipo | Validación |
|---|---|---|
| `pedidoId` | `Long` |  |
| `numero` | `String` |  |
| `estado` | `EstadoPedido` |  |
| `estadoPago` | `EstadoPago` |  |
| `total` | `BigDecimal` |  |
| `minutosEstimados` | `Integer` |  |

#### `DetallePedidoResponse` — Línea de un pedido.

| Campo | Tipo | Validación |
|---|---|---|
| `id` | `Long` |  |
| `nombre` | `String` |  |
| `descripcion` | `String` |  |
| `cantidad` | `Integer` |  |
| `precioUnitario` | `BigDecimal` |  |
| `subtotal` | `BigDecimal` |  |
| `notas` | `String` |  |
| `adicionales` | `List<AdicionalResponse>` |  |

#### `EtapaSeguimientoResponse` — Etapa visible en el seguimiento.

| Campo | Tipo | Validación |
|---|---|---|
| `nombre` | `String` |  |
| `completada` | `boolean` |  |
| `actual` | `boolean` |  |
| `fecha` | `Instant` |  |

#### `HistorialEstadoResponse` — Cambio de estado de un pedido.

| Campo | Tipo | Validación |
|---|---|---|
| `estado` | `EstadoPedido` |  |
| `comentario` | `String` |  |
| `fecha` | `Instant` |  |

#### `ItemCarritoResponse` — Ítem del carrito.

| Campo | Tipo | Validación |
|---|---|---|
| `id` | `Long` |  |
| `nombre` | `String` |  |
| `descripcion` | `String` |  |
| `imagenUrl` | `String` |  |
| `tamano` | `String` |  |
| `tipoMasa` | `String` |  |
| `cantidad` | `Integer` |  |
| `precioUnitario` | `BigDecimal` |  |
| `subtotal` | `BigDecimal` |  |
| `notas` | `String` |  |
| `adicionales` | `List<AdicionalResponse>` |  |

#### `PedidoResponse` — Detalle completo de un pedido.

| Campo | Tipo | Validación |
|---|---|---|
| `id` | `Long` |  |
| `numero` | `String` |  |
| `sucursalNombre` | `String` |  |
| `tipoEntrega` | `TipoEntrega` |  |
| `estado` | `EstadoPedido` |  |
| `direccionEntrega` | `DireccionResponse` |  |
| `instrucciones` | `String` |  |
| `detalles` | `List<DetallePedidoResponse>` |  |
| `montos` | `ResumenMontosResponse` |  |
| `minutosEstimados` | `Integer` |  |
| `creadoEn` | `Instant` |  |
| `confirmadoEn` | `Instant` |  |
| `entregadoEn` | `Instant` |  |
| `vencimientoRecojo` | `Instant` |  |
| `garantiaAplicada` | `boolean` |  |
| `pago` | `PagoResponse` |  |
| `historial` | `List<HistorialEstadoResponse>` |  |

#### `PedidoResumenResponse` — Fila del historial de pedidos.

| Campo | Tipo | Validación |
|---|---|---|
| `id` | `Long` |  |
| `numero` | `String` |  |
| `tipoEntrega` | `TipoEntrega` |  |
| `estado` | `EstadoPedido` |  |
| `total` | `BigDecimal` |  |
| `cantidadItems` | `Integer` |  |
| `creadoEn` | `Instant` |  |
| `nombreCliente` | `String` |  |
| `telefonoCliente` | `String` |  |

#### `ResumenMontosResponse` — Desglose de montos. Envío gratis desde S/ 49; de lo contrario S/ 5.00.

| Campo | Tipo | Validación |
|---|---|---|
| `subtotal` | `BigDecimal` |  |
| `costoDelivery` | `BigDecimal` |  |
| `descuento` | `BigDecimal` |  |
| `total` | `BigDecimal` |  |
| `envioGratisDesde` | `BigDecimal` |  |
| `faltanteEnvioGratis` | `BigDecimal` |  |

#### `SeguimientoResponse` — Seguimiento en vivo del pedido (4 etapas y reloj de cuenta regresiva).

| Campo | Tipo | Validación |
|---|---|---|
| `pedidoId` | `Long` |  |
| `numero` | `String` |  |
| `estado` | `EstadoPedido` |  |
| `etapas` | `List<EtapaSeguimientoResponse>` |  |
| `minutosRestantes` | `Integer` |  |
| `entregaEstimada` | `Instant` |  |
| `codigoEntrega` | `String` |  |
| `nombreMotorizado` | `String` |  |
| `garantiaAplicada` | `boolean` |  |

### response/personalizacion

#### `CotizacionPizzaResponse` — Precio en vivo de la pizza que se está armando.

| Campo | Tipo | Validación |
|---|---|---|
| `precioTamano` | `BigDecimal` |  |
| `recargoMasa` | `BigDecimal` |  |
| `totalIngredientes` | `BigDecimal` |  |
| `total` | `BigDecimal` |  |

#### `IngredienteSeleccionadoResponse` — Ingrediente elegido en una pizza personalizada.

| Campo | Tipo | Validación |
|---|---|---|
| `ingredienteId` | `Long` |  |
| `nombre` | `String` |  |
| `paso` | `PasoPersonalizacion` |  |
| `precioAplicado` | `BigDecimal` |  |

#### `OpcionesPersonalizacionResponse` — Lo necesario para armar la pizza en pantalla.

| Campo | Tipo | Validación |
|---|---|---|
| `tamanos` | `List<TamanoPizzaResponse>` |  |
| `tiposMasa` | `List<TipoMasaResponse>` |  |
| `pasos` | `List<PasoOpcionesResponse>` |  |

#### `PasoOpcionesResponse` — Un paso del armado de pizza con sus opciones.

| Campo | Tipo | Validación |
|---|---|---|
| `numero` | `Integer` |  |
| `etiqueta` | `String` |  |
| `maxSelecciones` | `Integer` |  |
| `opciones` | `List<IngredienteResponse>` |  |

#### `PizzaPersonalizadaResponse` — Pizza personalizada guardada.

| Campo | Tipo | Validación |
|---|---|---|
| `id` | `Long` |  |
| `nombre` | `String` |  |
| `tamano` | `TamanoPizzaResponse` |  |
| `tipoMasa` | `TipoMasaResponse` |  |
| `ingredientes` | `List<IngredienteSeleccionadoResponse>` |  |
| `precioTotal` | `BigDecimal` |  |

### response/resena

#### `CalificacionProductoResponse` — Calificación de un producto.

| Campo | Tipo | Validación |
|---|---|---|
| `productoId` | `Long` |  |
| `productoNombre` | `String` |  |
| `estrellas` | `Integer` |  |

#### `ResenaResponse` — Reseña de un cliente.

| Campo | Tipo | Validación |
|---|---|---|
| `id` | `Long` |  |
| `autor` | `String` |  |
| `calificacion` | `Integer` |  |
| `comentario` | `String` |  |
| `creadoEn` | `Instant` |  |
| `destacada` | `boolean` |  |
| `calificaciones` | `List<CalificacionProductoResponse>` |  |

#### `ResumenCalificacionResponse` — Promedio y total de reseñas.

| Campo | Tipo | Validación |
|---|---|---|
| `promedio` | `BigDecimal` |  |
| `total` | `long` |  |

### response/seguridad

#### `DireccionClienteResponse` — Dirección guardada del cliente.

| Campo | Tipo | Validación |
|---|---|---|
| `id` | `Long` |  |
| `etiqueta` | `String` |  |
| `direccion` | `DireccionResponse` |  |
| `favorita` | `boolean` |  |

#### `DireccionResponse` — Dirección con coordenadas.

| Campo | Tipo | Validación |
|---|---|---|
| `direccion` | `String` |  |
| `referencia` | `String` |  |
| `distrito` | `String` |  |
| `latitud` | `BigDecimal` |  |
| `longitud` | `BigDecimal` |  |

#### `EmpleadoResponse` — Empleado con su información laboral.

| Campo | Tipo | Validación |
|---|---|---|
| `id` | `Long` |  |
| `usuarioId` | `Long` |  |
| `nombreCompleto` | `String` |  |
| `correo` | `String` |  |
| `telefono` | `String` |  |
| `rol` | `Rol` |  |
| `sucursalId` | `Long` |  |
| `sucursalNombre` | `String` |  |
| `estado` | `EstadoEmpleado` |  |
| `horaInicio` | `LocalTime` |  |
| `horaFin` | `LocalTime` |  |
| `fechaIngreso` | `LocalDate` |  |
| `pagoBaseTurno` | `BigDecimal` |  |
| `bonoPorEntrega` | `BigDecimal` |  |
| `nombres` | `String` |  |
| `apellidos` | `String` |  |
| `tipoDocumento` | `TipoDocumento` |  |
| `numeroDocumento` | `String` |  |

#### `PerfilResponse` — Perfil completo del cliente autenticado.

| Campo | Tipo | Validación |
|---|---|---|
| `id` | `Long` |  |
| `nombres` | `String` |  |
| `apellidos` | `String` |  |
| `tipoDocumento` | `TipoDocumento` |  |
| `numeroDocumento` | `String` |  |
| `fechaNacimiento` | `LocalDate` |  |
| `telefono` | `String` |  |
| `correo` | `String` |  |
| `rol` | `Rol` |  |
| `avatarUrl` | `String` |  |
| `direcciones` | `List<DireccionClienteResponse>` |  |

#### `ResumenEmpleadosResponse` — Conteo de empleados por estado para el panel de administración.

| Campo | Tipo | Validación |
|---|---|---|
| `total` | `long` |  |
| `activos` | `long` |  |
| `enTurno` | `long` |  |
| `disponibles` | `long` |  |
| `inactivos` | `long` |  |
| `conLicencia` | `long` |  |

#### `TokenResponse` — Tokens emitidos al iniciar sesión o renovar.

| Campo | Tipo | Validación |
|---|---|---|
| `accessToken` | `String` |  |
| `refreshToken` | `String` |  |
| `tipo` | `String` |  |
| `expiraEnSegundos` | `long` |  |
| `usuario` | `UsuarioResponse` |  |

#### `UsuarioResponse` — Datos públicos de un usuario. Nunca incluye hash de contraseña.

| Campo | Tipo | Validación |
|---|---|---|
| `id` | `Long` |  |
| `nombres` | `String` |  |
| `apellidos` | `String` |  |
| `correo` | `String` |  |
| `telefono` | `String` |  |
| `rol` | `Rol` |  |
| `activo` | `boolean` |  |
| `avatarUrl` | `String` |  |
| `ultimoAcceso` | `Instant` |  |

### response/sucursal

#### `CoberturaResponse` — Resultado de la validación de cobertura.

| Campo | Tipo | Validación |
|---|---|---|
| `dentroCobertura` | `boolean` |  |
| `distanciaKm` | `BigDecimal` |  |
| `sucursalId` | `Long` |  |
| `sucursalNombre` | `String` |  |
| `costoEnvio` | `BigDecimal` |  |
| `minutosEstimados` | `Integer` |  |
| `mensaje` | `String` |  |

#### `HorarioSucursalResponse` — Horario de un día.

| Campo | Tipo | Validación |
|---|---|---|
| `diaSemana` | `DayOfWeek` |  |
| `horaApertura` | `LocalTime` |  |
| `horaCierre` | `LocalTime` |  |
| `cerrado` | `boolean` |  |

#### `LocalesResponse` — Sucursales para la pantalla Nuestros locales.

| Campo | Tipo | Validación |
|---|---|---|
| `sucursales` | `List<SucursalResponse>` |  |

#### `SucursalResponse` — Sucursal con horarios y zonas.

| Campo | Tipo | Validación |
|---|---|---|
| `id` | `Long` |  |
| `nombre` | `String` |  |
| `direccion` | `DireccionResponse` |  |
| `telefono` | `String` |  |
| `imagenUrl` | `String` |  |
| `activa` | `boolean` |  |
| `radioCoberturaKm` | `BigDecimal` |  |
| `abiertoAhora` | `boolean` |  |
| `horarios` | `List<HorarioSucursalResponse>` |  |
| `zonas` | `List<ZonaRepartoResponse>` |  |

#### `ZonaRepartoResponse` — Zona de reparto.

| Campo | Tipo | Validación |
|---|---|---|
| `id` | `Long` |  |
| `nombre` | `String` |  |
| `distanciaDesdeKm` | `BigDecimal` |  |
| `distanciaHastaKm` | `BigDecimal` |  |
| `costoEnvio` | `BigDecimal` |  |

## 6. DTOs comunes

#### `ApiError` — Formato único de error de la API. Lo produce el manejador global de excepciones.

| Campo | Tipo | Validación |
|---|---|---|
| `fecha` | `Instant` |  |
| `estado` | `int` |  |
| `codigo` | `String` |  |
| `mensaje` | `String` |  |
| `ruta` | `String` |  |
| `errores` | `List<CampoError>` |  |

#### `CampoError` — Error de validación asociado a un campo del request.

| Campo | Tipo | Validación |
|---|---|---|
| `campo` | `String` |  |
| `mensaje` | `String` |  |

#### `ConteoResponse` — Una cantidad: pendientes sin leer, alertas de stock, pagos conciliados.

| Campo | Tipo | Validación |
|---|---|---|
| `total` | `long` |  |

#### `MensajeResponse` — Respuesta simple con un mensaje, para operaciones sin cuerpo propio.

| Campo | Tipo | Validación |
|---|---|---|
| `mensaje` | `String` |  |

#### `PageResponse` — Página de resultados con metadatos.

| Campo | Tipo | Validación |
|---|---|---|
| `contenido` | `List<T>` |  |
| `pagina` | `int` |  |
| `tamano` | `int` |  |
| `totalElementos` | `long` |  |
| `totalPaginas` | `int` |  |
| `primera` | `boolean` |  |
| `ultima` | `boolean` |  |

## 7. Enums

- **CanalInventario**: `ONLINE` (Online), `FISICO` (Físico)
- **CarpetaImagen**: `PRODUCTOS`, `PROMOCIONES`, `SUCURSALES`, `NEGOCIO`
- **ColorPromocion**: `ROJO` (Rojo), `VERDE` (Verde), `BLANCO` (Blanco)
- **EstadoCarrito**: `ACTIVO` (Activo), `CONVERTIDO` (Convertido en pedido), `ABANDONADO` (Abandonado)
- **EstadoEmpleado**: `ACTIVO` (Activo), `EN_TURNO` (En turno), `DISPONIBLE` (Disponible), `INACTIVO` (Inactivo), `CON_LICENCIA` (Con licencia)
- **EstadoEntrega**: `SIN_ASIGNAR` (Sin asignar), `ASIGNADA` (Asignada), `EN_CAMINO` (En camino), `ENTREGADA` (Entregada), `FALLIDA` (Fallida)
- **EstadoPago**: `PENDIENTE` (Pendiente), `APROBADO` (Aprobado), `RECHAZADO` (Rechazado), `REEMBOLSADO` (Reembolsado)
- **EstadoPagoPersonal**: `PENDIENTE` (Pendiente), `PAGADO` (Pagado)
- **EstadoPedido**: `PENDIENTE_PAGO` (Pendiente de pago), `CONFIRMADO` (Confirmado), `EN_PREPARACION` (En preparación), `EN_HORNO` (En el horno), `LISTO` (Listo), `EN_CAMINO` (En camino), `ENTREGADO` (Entregado), `CANCELADO` (Cancelado), `NO_RECOGIDO` (No recogido)
- **EstadoTurno**: `PROGRAMADO` (Programado), `EN_CURSO` (En curso), `FINALIZADO` (Finalizado)
- **MetodoPago**: `TARJETA` (Tarjeta de crédito / débito), `YAPE` (Yape), `PLIN` (Plin), `CMR` (CMR)
- **PasoPersonalizacion**: `TAMANO_MASA`, `QUESO`, `SALSA`, `INGREDIENTES`, `RESUMEN`
- **Rol**: `ADMINISTRADOR` (Administrador), `CLIENTE` (Cliente), `PIZZERO` (Pizzero), `DESPACHADOR` (Despachador), `MOTORIZADO` (Motorizado)
- **TipoDocumento**: `DNI` (DNI), `CE` (Carné de extranjería), `PASAPORTE` (Pasaporte)
- **TipoEntrega**: `DELIVERY` (Delivery), `RECOJO` (Recojo en tienda)
- **TipoIngrediente**: `QUESO` (Queso), `SALSA` (Salsa), `CARNE` (Carne), `OTRO` (Otro ingrediente)
- **TipoMovimientoFinanciero**: `INGRESO` (Ingreso), `EGRESO` (Egreso)
- **TipoMovimientoInventario**: `ENTRADA` (Entrada), `SALIDA` (Salida), `AJUSTE` (Ajuste), `MERMA` (Merma)
- **TipoNotificacion**: `PEDIDO_NUEVO` (Pedido nuevo), `PEDIDO_LISTO` (Pedido listo), `ENTREGA_ASIGNADA` (Entrega asignada), `STOCK_BAJO` (Stock bajo), `ALERTA_OFERTA_FLASH` (Alerta de oferta flash), `SISTEMA` (Sistema)
- **TipoParametro**: `TEXTO` (Texto), `NUMERO` (Número), `BOOLEANO` (Verdadero o falso)
- **TipoPromocion**: `COMBO` (Combo), `DOS_POR_UNO` (2x1), `DESCUENTO` (Descuento), `OFERTA_FLASH` (Oferta flash)
- **UnidadMedida**: `KILOGRAMO` (kg), `GRAMO` (g), `LITRO` (l), `MILILITRO` (ml), `UNIDAD` (unidad)

## 8. Códigos de error

| Código | Excepción | Mensaje base | Capa |
|---|---|---|---|
| `ACCESO_DENEGADO` | HTTP 403 | No tienes permiso para esta acción | global |
| `ADICIONAL_NO_DISPONIBLE` | ReglaNegocioException | Uno de los adicionales ya no está disponible | pedido |
| `ARCHIVO_MUY_GRANDE` | HTTP 413 | El archivo es demasiado grande | global |
| `ARCHIVO_REQUERIDO` | HTTP 400 | Falta el archivo '{nombre}'| global |
| `ASIGNACION_REQUERIDA` | ReglaNegocioException | El pedido sale a reparto al asignar un motorizado | pedido |
| `CALIFICACION_REPETIDA` | ReglaNegocioException | Un producto solo se califica una vez | resena |
| `CARRITO_VACIO` | ReglaNegocioException | Tu carrito está vacío | pedido |
| `CATEGORIA_CON_PRODUCTOS` | ConflictoException | La categoría tiene productos. Muévelos a otra categoría o desactívala en lugar de eliminarla | catalogo |
| `CATEGORIA_DUPLICADA` | ConflictoException | Ya existe una categoría llamada "{nombre}"| catalogo |
| `CONFLICTO_CONCURRENCIA` | HTTP 409 | El registro cambió mientras lo editabas. Vuelve a intentarlo | global |
| `CONFLICTO_DATOS` | HTTP 409 | La operación choca con datos que ya existen | global |
| `CONTRASENAS_NO_COINCIDEN` | ReglaNegocioException | Las contraseñas no coinciden | seguridad |
| `CONTRASENA_ACTUAL_INCORRECTA` | ReglaNegocioException | La contraseña actual no es correcta | seguridad |
| `CONTRASENA_REPETIDA` | ReglaNegocioException | La nueva contraseña debe ser distinta a la que ya usas | seguridad |
| `CONTRASENA_REQUERIDA` | ReglaNegocioException | Indica una contraseña inicial para el empleado | seguridad |
| `CORREO_DUPLICADO` | ConflictoException | Ya existe una cuenta con ese correo | seguridad |
| `CREDENCIALES_INVALIDAS` | NoAutenticadoException | Correo o contraseña incorrectos | seguridad |
| `CUENTA_INACTIVA` | AccesoDenegadoException | Tu cuenta está desactivada. Contacta al local. | seguridad |
| `CUERPO_INVALIDO` | HTTP 400 | El cuerpo de la solicitud no es válido | global |
| `DATOS_PAGO_INCOMPLETOS` | ReglaNegocioException | Falta el token de la tarjeta | pago |
| `DIRECCION_REQUERIDA` | ReglaNegocioException | Indica la dirección de entrega | pedido |
| `DOCUMENTO_DUPLICADO` | ConflictoException | Ya existe una cuenta con ese documento | seguridad |
| `ENTREGA_EN_CURSO` | ReglaNegocioException | La entrega ya salió y no se puede reasignar | operacion |
| `ENTREGA_NO_ASIGNADA` | ReglaNegocioException | Esta entrega no está lista para salir | operacion |
| `ENTREGA_NO_EN_CAMINO` | ReglaNegocioException | La entrega no está en camino | operacion |
| `ERROR_INTERNO` | HTTP 500 | Ocurrió un error inesperado. Inténtalo de nuevo más tarde | global |
| `ETIQUETA_DUPLICADA` | ConflictoException | Ya existe una etiqueta llamada "{nombre}"| catalogo |
| `HORARIO_INVALIDO` | ReglaNegocioException | La hora de inicio y fin no pueden ser iguales | seguridad |
| `HORARIO_REPETIDO` | ReglaNegocioException | Un día no puede tener dos horarios | sucursal |
| `HORARIO_REQUERIDO` | ReglaNegocioException | Una sucursal activa necesita al menos un día abierto con hora de apertura y de cierre | sucursal |
| `IMAGEN_INVALIDA` | ReglaNegocioException | No pudimos leer la imagen | archivo |
| `IMAGEN_MUY_GRANDE` | ReglaNegocioException | La imagen pesa más de  | archivo |
| `IMAGEN_NO_GUARDADA` | ReglaNegocioException | No pudimos guardar la imagen. Inténtalo de nuevo | archivo |
| `IMAGEN_REQUERIDA` | ReglaNegocioException | Elige una imagen para subir | archivo |
| `INGREDIENTE_INVALIDO` | ReglaNegocioException | Uno de los ingredientes elegidos no está disponible para "{paso}"| personalizacion |
| `ITEM_INVALIDO` | ReglaNegocioException | Indica un producto, una pizza personalizada o una promoción | pedido |
| `MASA_NO_DISPONIBLE` | ReglaNegocioException | Esa masa no está disponible | pedido |
| `MAXIMO_EXCEDIDO` | ReglaNegocioException | En "{paso}" superaste el máximo| personalizacion |
| `METODO_NO_DISPONIBLE` | ReglaNegocioException | Ese método de pago no está disponible | pago |
| `METODO_NO_PERMITIDO` | HTTP 405 | Esa ruta no admite  | global |
| `MONTO_INVALIDO` | ReglaNegocioException | El reembolso debe ser mayor a cero y no superar S/  | pago |
| `MOTORIZADO_NO_DISPONIBLE` | ReglaNegocioException | Ese motorizado no está disponible en esta sucursal | operacion |
| `OPCIONES_NO_APLICAN` | ReglaNegocioException | Este producto no admite tamaño, masa ni adicionales | pedido |
| `OPCIONES_REQUERIDAS` | ReglaNegocioException | Elige el tamaño y la masa de la pizza | pedido |
| `PAGO_EN_CURSO` | ConflictoException | Ya hay un pago en proceso para este pedido | pago |
| `PAGO_PENDIENTE_CONFIRMACION` | ReglaNegocioException | Estamos confirmando tu pago con el medio de pago. Revisa el estado de tu pedido en unos minutos  y no vuelvas a pagar. | pago |
| `PAGO_YA_REGISTRADO` | ConflictoException | Este pago ya fue registrado | finanzas |
| `PARAMETRO_FALTANTE` | HTTP 400 | Falta el parámetro '{nombre}'| global |
| `PARAMETRO_INVALIDO` | ReglaNegocioException | El parámetro  | configuracion |
| `PEDIDO_NO_ENTREGADO` | ReglaNegocioException | Solo puedes opinar sobre pedidos entregados | resena |
| `PEDIDO_NO_PAGABLE` | ReglaNegocioException | Este pedido ya no admite pago | pago |
| `PERIODO_LIQUIDADO` | ConflictoException | Ese periodo ya fue liquidado para este motorizado | finanzas |
| `PERSONAS_INVALIDAS` | ReglaNegocioException | El mínimo de personas no puede ser mayor que el máximo | catalogo |
| `PIN_BLOQUEADO` | ReglaNegocioException | Demasiados intentos. Pide ayuda al despachador | operacion |
| `PIN_INCORRECTO` | ReglaNegocioException | El PIN no coincide con el del cliente | operacion |
| `PIN_REQUERIDO` | ReglaNegocioException | La entrega a domicilio se confirma con el PIN del cliente | pedido |
| `PRECIOS_REQUERIDOS` | ReglaNegocioException | Indica el precio de al menos un tamaño | catalogo |
| `PRODUCTO_AJENO` | ReglaNegocioException | Solo puedes calificar productos de este pedido | resena |
| `PRODUCTO_NO_DISPONIBLE` | ReglaNegocioException | El producto ya no está disponible | pedido |
| `PROMOCION_NO_VIGENTE` | ReglaNegocioException | La promoción ya no está vigente | pedido |
| `RANGO_INVALIDO` | ReglaNegocioException | La fecha inicial no puede ser posterior a la final | finanzas |
| `RANGO_MUY_AMPLIO` | ReglaNegocioException | El periodo no puede superar un año | finanzas |
| `REFRESH_INVALIDO` | NoAutenticadoException | La sesión expiró. Inicia sesión nuevamente. | seguridad |
| `RESENA_EXISTENTE` | ConflictoException | Ya dejaste una reseña para este pedido | resena |
| `ROL_NO_PERMITIDO` | ReglaNegocioException | Un empleado solo puede ser pizzero, despachador o motorizado | seguridad |
| `RUTA_NO_ENCONTRADA` | HTTP 404 | La ruta solicitada no existe | global |
| `SIN_ENTREGA` | ReglaNegocioException | El pedido no es de delivery o todavía no está listo | operacion |
| `SIN_PAGO` | ReglaNegocioException | El pedido no tiene un pago aprobado | pago |
| `SIN_PERFIL_PERSONAL` | AccesoDenegadoException | Tu usuario no tiene un perfil de personal asignado | operacion |
| `SIN_SUCURSALES` | ReglaNegocioException | No hay sucursales disponibles por ahora | sucursal |
| `STOCK_INSUFICIENTE` | ReglaNegocioException | No hay stock suficiente para ese movimiento | operacion |
| `STOCK_WEB_NO_CONFIGURADO` | ReglaNegocioException | Falta configurar el ingrediente de masa del stock web (parámetro  | operacion |
| `SUCURSAL_CERRADA` | ReglaNegocioException | La sucursal está cerrada en este momento | pedido |
| `SUCURSAL_DUPLICADA` | ReglaNegocioException | Ya existe una sucursal con ese nombre | sucursal |
| `SUCURSAL_INACTIVA` | ReglaNegocioException | La sucursal elegida no está disponible | pedido |
| `TAMANO_DUPLICADO` | ConflictoException | Ya existe un tamaño llamado "{nombre}"| catalogo |
| `TAMANO_NO_DISPONIBLE` | ReglaNegocioException | Ese tamaño no está disponible | pedido |
| `TAMANO_REPETIDO` | ReglaNegocioException | Un tamaño no puede tener dos precios | catalogo |
| `TOKEN_INVALIDO` | ReglaNegocioException | El enlace de recuperación no es válido o ya venció | seguridad |
| `TRANSICION_INVALIDA` | ReglaNegocioException | No se puede pasar el pedido de  | policy |
| `USAR_CANCELACION` | ReglaNegocioException | Para cancelar usa la cancelación del pedido, que también gestiona el reembolso | pedido |
| `VALIDACION_FALLIDA` | HTTP 400 | Revisa los datos enviados | global |
| `VIGENCIA_INVALIDA` | ReglaNegocioException | La promoción debe terminar después de que empieza | catalogo |
| `ZONA_INVALIDA` | ReglaNegocioException | En la zona "{zona}" la distancia es inválida| sucursal |
| `ZONA_REPETIDA` | ReglaNegocioException | Hay dos zonas con el mismo nombre | sucursal |

## 9. Parámetros del sistema (`/admin/configuracion/parametros/{clave}`)

| Clave | Por defecto | Qué controla |
|---|---|---|
| `envio_gratis_desde` | 49.00 | Subtotal desde el cual el delivery es gratis. |
| `costo_delivery_base` | 5.00 | Delivery cuando no hay zona configurada. |
| `radio_cobertura_km` | 3.5 | Radio mostrado si no hay sucursales activas. |
| `minutos_preparacion` | 25 | Minutos de cocina por pedido. |
| `minutos_por_km` | 4 | Minutos de viaje por km. |
| `minutos_vencimiento_recojo` | 90 | Espera de un recojo antes de `NO_RECOGIDO`. |
| `minutos_expiracion_pago` | 15 | Espera de un pedido sin pago antes de cancelarse. |
| `minutos_tolerancia_garantia` | 10 | Tolerancia antes de la Garantía TOTO. |
| `ingrediente_masa_id` | — | Ingrediente que representa la masa en el stock web (canal ONLINE). |

## 10. Migraciones y estado actual

- `db/migration`: `V1__esquema_inicial`, `V2__datos_base` (etiquetas, métodos de pago, perfil, categorías…), `V102__secuencia_numero_pedido`, `V103__catalogo_administrable` (`producto_ingredientes`, `tamanos_pizza.activo`, `productos.imagen_url` a 500). `db/dev`: `V100__datos_demo` (usuarios y sede demo), `V101__catalogo_promociones_y_sucursales_ica`. La próxima migración es **V104**.
- **Sin compilar todavía** (escritos sin acceso a Maven, revisados a mano): `codigoAprobacion` de Yape/Plin, nuevos campos de `PedidoListoResponse`/`EntregaAsignadaResponse`/`PedidoResumenResponse`/`EmpleadoResponse`, correo SMTP, `CONTRASENA_REPETIDA`, CRUD de categorías/etiquetas/tamaños, ingredientes por producto, subida de imágenes. Primer paso en una sesión nueva: `mvnw.cmd clean compile` y corregir lo que falle.
- Pendientes conocidos: los productos demo no tienen ingredientes asignados (llenarlos desde el panel o con una migración `db/dev`); solo existe el test de contexto (`TotospizzaEstructuraApplicationTests`), no hay tests de servicios.
