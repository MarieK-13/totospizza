/**
 * Imágenes exportadas de Figma para los paneles de acceso (rutas dentro de `public/`).
 * Mientras valgan `null` se usa la versión armada con CSS y las fotos del proyecto.
 *
 *   login:    'images/auth-login.png'     (panel rojo con la pizza y los garabatos)
 *   registro: 'images/auth-registro.jpg'  (foto de la pizza sobre fondo rojo)
 */
export const ARTE_ACCESO: { readonly login: string | null; readonly registro: string | null } = {
  login: null,
  registro: null,
};
