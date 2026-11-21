# Toto's Pizza · Sistema web de pedidos

Pasa del prototipo de Figma (APF3) a la web oficial del Proyecto Final.

**Stack:** Angular (frontend) · Spring Boot (backend) · PostgreSQL (base de datos)
**Arquitectura:** 3 capas (presentación, negocio y datos)


## Estructura raíz

```
toto-pizza/
├── backend/     API REST con Spring Boot
├── frontend/    Aplicación Angular
├── database/    Diagramas y scripts de PostgreSQL
├── docs/        Documentación y entregables del Proyecto Final
├── infra/       Docker y Nginx
└── .github/     Flujos de integración continua
```

## Las 3 capas en el backend

| Capa | Carpetas (`backend/src/main/java/com/totospizza/`) |
|---|---|
| Presentación | `controller/`, `dto/`, `mapper/`, `exception/` |
| Negocio | `service/` (interfaces), `service/impl/` (implementaciones), `rules/`, `integration/`, `scheduler/`, `realtime/` |
| Datos | `repository/`, `model/` |
| Transversal | `config/`, `security/`, `validation/`, `util/`, `constant/` |

Los subpaquetes de dominio (`seguridad`, `catalogo`, `personalizacion`, `pedido`, `pago`, `sucursal`, `operacion`, `resena`, `finanzas`, `configuracion`) se repiten en `model/entity`, `repository`, `service`, `service/impl`, `mapper` y `dto`.
Los controladores se agrupan por área de la API y rol: `auth`, `publico`, `cliente`, `cocina`, `despacho`, `reparto` y `admin`.

## Del Figma al código

| Pantallas de Figma | Frontend (`src/app/features/`) | Backend (`controller/`) |
|---|---|---|
| Login, Registro, Olvidé mi contraseña | `auth` | `auth` |
| Home | `home` | `publico` |
| Menú y Detalle de pedido | `catalogo` | `publico` |
| Personalización (5 pasos) | `personalizacion` | `cliente` |
| Carrito | `carrito` | `cliente` |
| Checkout | `checkout` | `cliente`, `publico` (cobertura) |
| Confirmación y Seguimiento | `pedido` | `cliente` + `realtime` |
| Perfil | `perfil` | `cliente` |
| Locales y Nosotros | `locales`, `nosotros` | `publico` |
| Panel de cocina | `cocina` | `cocina` |
| Mostrador | `despacho` | `despacho` |
| Mis entregas | `reparto` | `reparto` |
| Resumen, Pedidos, Empleados, Finanzas y Configuración | `admin/*` | `admin` |

## Frontend

- `core/`: guards, interceptors, servicios y configuración que existen una sola vez en toda la app.
- `shared/components/`: los componentes reutilizables del Design System (botones, inputs, cards, modales, chips, stepper, etc.).
- `layout/`: header, footer, barra de aviso, sidebar y los layouts (cliente, autenticación, dashboard y personal interno).
- `features/`: un módulo por área, cada uno con `pages/`, `components/`, `services/` y `models/`.
- `styles/tokens/`: los tokens del Design System (color, tipografía, espaciado, radios, sombras y movimiento).

## Entregables del Proyecto Final (`docs/proyecto-final/`)

1. `01-prototipo-final`: navegación funcional e interacciones completas.
2. `02-pruebas-usabilidad`: plan, guiones, consentimientos, registros, resultados y evidencias.
3. `03-mejoras-aplicadas`: antes vs después e iteraciones.
4. `04-documentacion`: decisiones de diseño, cambios realizados y justificación UX/UI.
5. `05-presentacion-final`: diapositivas, guion de la demostración y argumentación técnica.

## Convenciones

- Nombres técnicos de capas y componentes en inglés (`controller`, `service`, `product-card`).
- Nombres de dominio en español (`pedido`, `catalogo`, `cocina`).
- `GLOSSARY.md` y los ADR en `docs/adr/` se crean cuando se resuelvan los primeros términos y decisiones.


