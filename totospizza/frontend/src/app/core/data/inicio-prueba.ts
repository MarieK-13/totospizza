import type { HomeResponse, PromocionResponse } from '../models/api';
import { MENU_PRUEBA } from './menu-prueba';

const vigencia = null;

const item = (productoId: number, productoNombre: string, tamanoNombre: string | null = null, cantidad = 1) => ({ productoId, productoNombre, tamanoId: null, tamanoNombre, cantidad });

const PROMOCIONES: readonly PromocionResponse[] = [
  {
    id: 9001,
    titulo: 'La noche sabe mejor en familia',
    descripcion: 'Pepperoni y Carnívora familiares + 2 Inca Kola de 500 ml.',
    tipo: 'DESCUENTO',
    etiqueta: 'Promo familiar',
    precioPromocional: 89.9,
    precioAnterior: 106,
    imagenUrl: 'images/hero-promo-familiar.jpg',
    colorFondo: 'ROJO',
    condiciones: 'Modo prueba: promoción de ejemplo.',
    vigenteHasta: vigencia,
    items: [item(1, 'Pepperoni', 'Familiar'), item(5, 'Carnívora', 'Familiar'), item(102, 'Inca Kola 500 ml', null, 2)],
  },
  {
    id: 9002,
    titulo: 'Pizza veggie para compartir',
    descripcion: 'Verde familiar + 2 Coca-Cola de 500 ml.',
    tipo: 'DESCUENTO',
    etiqueta: 'Oferta',
    precioPromocional: 49.9,
    precioAnterior: 58,
    imagenUrl: 'images/hero-oferta-veggie.jpg',
    colorFondo: 'VERDE',
    condiciones: 'Modo prueba: promoción de ejemplo.',
    vigenteHasta: vigencia,
    items: [item(4, 'Verde', 'Familiar'), item(101, 'Coca-Cola 500 ml', null, 2)],
  },
  ...(
    [
      [9101, 'Coca-Cola', 101, 'Coca-Cola 500 ml', 'images/cocacola.jpg', 34.9],
      [9102, 'Inca Kola', 102, 'Inca Kola 500 ml', 'images/InkaK.jpg', 34.9],
      [9103, 'Agua', 103, 'Agua sin gas 625 ml', null, 33.9],
    ] as const
  ).map(
    ([id, opcion, bebidaId, bebida, imagen, precio]): PromocionResponse => ({
      id,
      titulo: `Pack Pepperoni + ${opcion}`,
      descripcion: 'Pizza Pepperoni mediana + 1 bebida a tu elección.',
      tipo: 'COMBO',
      etiqueta: 'Pack Pepperoni & Co',
      precioPromocional: precio,
      precioAnterior: 37,
      imagenUrl: imagen,
      colorFondo: 'ROJO',
      condiciones: null,
      vigenteHasta: vigencia,
      items: [item(1, 'Pepperoni', 'Mediana'), item(bebidaId, bebida)],
    }),
  ),
  ...(
    [
      [9201, 'Diavola', 3, 'images/diavola.jpg', 94.9],
      [9202, 'Margherita', 2, 'images/margherita.jpg', 89.9],
    ] as const
  ).map(
    ([id, opcion, pizzaId, imagen, precio]): PromocionResponse => ({
      id,
      titulo: `Banquete Familiar + ${opcion}`,
      descripcion: 'Carnívora familiar + otra pizza familiar a tu elección.',
      tipo: 'COMBO',
      etiqueta: 'Banquete Familiar',
      precioPromocional: precio,
      precioAnterior: 96,
      imagenUrl: imagen,
      colorFondo: 'ROJO',
      condiciones: null,
      vigenteHasta: vigencia,
      items: [item(5, 'Carnívora', 'Familiar'), item(pizzaId, opcion, 'Familiar')],
    }),
  ),
];

export const INICIO_PRUEBA: HomeResponse = {
  promociones: PROMOCIONES,
  destacados: MENU_PRUEBA.filter((p) => p.destacado),
  resenas: [],
  negocio: {
    nombreComercial: "Toto's Pizza",
    logoUrl: null,
    whatsapp: null,
    instagramUrl: null,
    facebookUrl: null,
    envioGratisDesde: 49,
    costoDeliveryBase: 5,
    radioCoberturaKm: 3.5,
    metodosPago: [],
  },
};
