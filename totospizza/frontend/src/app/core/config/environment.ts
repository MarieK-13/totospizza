/** Configuración de desarrollo. Para producción se reemplaza por `environment.prod.ts` (fileReplacements). */
export const environment = {
  production: false,
  /** Base de la API REST del backend (Spring Boot). */
  apiUrl: 'http://localhost:8080/api/v1',
  /** true: el menú y el detalle usan 5 pizzas de prueba en vez del backend. Poner en false cuando el backend responda. */
  menuDatosDePrueba: true,
} as const;
