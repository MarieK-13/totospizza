import type { IngredienteResponse, OpcionesPersonalizacionResponse } from '../models/api';

/**
 * Opciones de "Arma tu pizza" sin backend (se activan con `environment.menuDatosDePrueba`).
 * Precios y tamaños iguales a los datos demo del backend (V100__datos_demo.sql).
 */
const ing = (id: number, nombre: string, tipo: IngredienteResponse['tipo'], precioExtra: number): IngredienteResponse => ({
  id,
  nombre,
  tipo,
  precioExtra,
  disponible: true,
});

export const OPCIONES_PERSONALIZACION_PRUEBA: OpcionesPersonalizacionResponse = {
  tamanos: [
    { id: 1, nombre: 'Personal', diametroCm: 22, personasMin: 1, personasMax: 1, precioBase: 18 },
    { id: 2, nombre: 'Mediana', diametroCm: 30, personasMin: 2, personasMax: 3, precioBase: 32 },
    { id: 3, nombre: 'Familiar', diametroCm: 40, personasMin: 4, personasMax: 5, precioBase: 48 },
  ],
  tiposMasa: [
    { id: 1, nombre: 'Clásica', recargo: 0 },
    { id: 2, nombre: 'Delgada', recargo: 0 },
    { id: 3, nombre: 'Borde de queso', recargo: 6 },
  ],
  pasos: [
    {
      numero: 2,
      etiqueta: 'Tipo de queso',
      maxSelecciones: 2,
      opciones: [ing(201, 'Mozzarella', 'QUESO', 4), ing(202, 'Queso parmesano', 'QUESO', 4), ing(203, 'Cheddar', 'QUESO', 4), ing(204, 'Provolone', 'QUESO', 5)],
    },
    {
      numero: 3,
      etiqueta: 'Salsas',
      maxSelecciones: 2,
      opciones: [ing(301, 'Salsa de tomate', 'SALSA', 0), ing(302, 'Salsa BBQ', 'SALSA', 2), ing(303, 'Pesto', 'SALSA', 3), ing(304, 'Crema de ajo', 'SALSA', 2)],
    },
    {
      numero: 4,
      etiqueta: 'Ingredientes',
      maxSelecciones: 2,
      opciones: [
        ing(401, 'Pepperoni', 'CARNE', 5),
        ing(402, 'Jamón', 'CARNE', 4),
        ing(403, 'Tocino', 'CARNE', 5),
        ing(404, 'Carne molida', 'CARNE', 5),
        ing(405, 'Pollo', 'CARNE', 5),
        ing(406, 'Salami', 'CARNE', 5),
        ing(407, 'Champiñones', 'OTRO', 3),
        ing(408, 'Aceitunas', 'OTRO', 2),
        ing(409, 'Pimiento', 'OTRO', 2),
        ing(410, 'Cebolla', 'OTRO', 2),
        ing(411, 'Piña', 'OTRO', 3),
        ing(412, 'Jalapeño', 'OTRO', 2),
      ],
    },
  ],
};
