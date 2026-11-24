import type {
  CategoriaResponse,
  EtiquetaResponse,
  IngredienteResponse,
  MenuFiltrosResponse,
  PrecioTamanoResponse,
  ProductoDetalleResponse,
  ProductoResumenResponse,
  TipoMasaResponse,
} from '../models/api';


const CATEGORIA: CategoriaResponse = { id: 1, nombre: 'Pizzas', slug: 'pizzas' };
const BEBIDAS: CategoriaResponse = { id: 2, nombre: 'Bebidas', slug: 'bebidas' };
const SALSAS: CategoriaResponse = { id: 3, nombre: 'Salsas', slug: 'salsas' };

const etiqueta = (id: number, nombre: string, slug: string, esFiltro = true): EtiquetaResponse => ({ id, nombre, slug, esFiltro });

const GLUTEN = etiqueta(1, 'Contiene Gluten', 'contiene-gluten', false);
const LACTEOS = etiqueta(2, 'Contiene Lácteos', 'contiene-lacteos', false);
const SIN_LACTEOS = etiqueta(3, 'Sin Lácteos', 'sin-lacteos');
const VEGETARIANA = etiqueta(4, 'Vegetariana', 'vegetariana');
const PICANTE = etiqueta(5, 'Picante', 'picante');

const PRECIOS: readonly PrecioTamanoResponse[] = [
  { tamanoId: 1, tamanoNombre: 'Personal', precio: 18 },
  { tamanoId: 2, tamanoNombre: 'Mediana', precio: 32 },
  { tamanoId: 3, tamanoNombre: 'Familiar', precio: 48 },
];

const MASAS: readonly TipoMasaResponse[] = [
  { id: 1, nombre: 'Clásica', recargo: 0 },
  { id: 2, nombre: 'Delgada', recargo: 0 },
  { id: 3, nombre: 'Borde de queso', recargo: 6 },
];

const ingrediente = (id: number, nombre: string, tipo: IngredienteResponse['tipo'], precioExtra: number): IngredienteResponse => ({
  id,
  nombre,
  tipo,
  precioExtra,
  disponible: true,
});

const ADICIONALES: readonly IngredienteResponse[] = [
  ingrediente(1, 'Queso extra', 'QUESO', 4),
  ingrediente(2, 'Salsa de ajo', 'SALSA', 2),
  ingrediente(3, 'Salsa picante', 'SALSA', 2),
  ingrediente(4, 'Pepperoni extra', 'CARNE', 5),
  ingrediente(5, 'Aceitunas', 'OTRO', 3),
];

interface Semilla {
  readonly id: number;
  readonly nombre: string;
  readonly slug: string;
  readonly descripcion: string;
  readonly destacado: boolean;
  readonly calificacion: number;
  readonly resenas: number;
  readonly ingredientes: string;
  readonly etiquetas: readonly EtiquetaResponse[];
}

const SEMILLAS: readonly Semilla[] = [
  {
    id: 1,
    nombre: 'Pepperoni',
    slug: 'pepperoni',
    ingredientes: 'Masa de fermentación lenta, salsa de tomate italiano, mozzarella, pepperoni artesanal, orégano.',
    descripcion: 'Salsa de tomate, mozzarella y abundante pepperoni crocante.',
    destacado: true,
    calificacion: 4.8,
    resenas: 124,
    etiquetas: [GLUTEN, LACTEOS],
  },
  {
    id: 2,
    nombre: 'Margherita',
    slug: 'margherita',
    ingredientes: 'Masa de fermentación lenta, salsa de tomate italiano, mozzarella fresca, albahaca, aceite de oliva.',
    descripcion: 'Salsa de tomate, mozzarella fresca y albahaca.',
    destacado: false,
    calificacion: 4.6,
    resenas: 87,
    etiquetas: [GLUTEN, LACTEOS, VEGETARIANA],
  },
  {
    id: 3,
    nombre: 'Diavola',
    slug: 'diavola',
    ingredientes: 'Masa de fermentación lenta, salsa de tomate, mozzarella, salami picante, ají en hojuelas.',
    descripcion: 'Salami picante, mozzarella y ají en hojuelas.',
    destacado: true,
    calificacion: 4.7,
    resenas: 63,
    etiquetas: [GLUTEN, LACTEOS, PICANTE],
  },
  {
    id: 4,
    nombre: 'Verde',
    slug: 'verde',
    ingredientes: 'Masa de fermentación lenta, pesto de albahaca, mozzarella, zapallito, pimiento y berenjena asados.',
    descripcion: 'Pesto de albahaca, vegetales asados y mozzarella.',
    destacado: false,
    calificacion: 4.5,
    resenas: 41,
    etiquetas: [GLUTEN, LACTEOS, VEGETARIANA],
  },
  {
    id: 5,
    nombre: 'Carnívora',
    slug: 'carnivora',
    ingredientes: 'Masa de fermentación lenta, salsa de tomate, mozzarella, jamón, tocino, chorizo, carne molida.',
    descripcion: 'Jamón, tocino, chorizo y carne molida sobre queso derretido.',
    destacado: false,
    calificacion: 4.9,
    resenas: 98,
    etiquetas: [GLUTEN, LACTEOS],
  },
];

/** Productos sin tamaño ni masa: se agregan directo al carrito. */
interface Simple {
  readonly id: number;
  readonly nombre: string;
  readonly slug: string;
  readonly descripcion: string;
  readonly categoria: CategoriaResponse;
  readonly precio: number;
  readonly imagenUrl: string | null;
  readonly etiquetas: readonly EtiquetaResponse[];
}

const SIMPLES: readonly Simple[] = [
  { id: 101, nombre: 'Coca-Cola 500 ml', slug: 'coca-cola-500', descripcion: 'Bien helada, para acompañar tu pizza.', categoria: BEBIDAS, precio: 5, imagenUrl: 'images/cocacola.jpg', etiquetas: [] },
  { id: 102, nombre: 'Inca Kola 500 ml', slug: 'inca-kola-500', descripcion: 'La de sabor nacional, bien helada.', categoria: BEBIDAS, precio: 5, imagenUrl: 'images/InkaK.jpg', etiquetas: [] },
  { id: 103, nombre: 'Agua sin gas 625 ml', slug: 'agua-sin-gas', descripcion: 'Agua de mesa sin gas.', categoria: BEBIDAS, precio: 3, imagenUrl: null, etiquetas: [] },
  { id: 104, nombre: 'Salsa de ajo', slug: 'salsa-ajo', descripcion: 'Cremosa, para los bordes.', categoria: SALSAS, precio: 2, imagenUrl: null, etiquetas: [LACTEOS] },
  { id: 105, nombre: 'Salsa picante', slug: 'salsa-picante', descripcion: 'Rocoto y ají, pica de verdad.', categoria: SALSAS, precio: 2, imagenUrl: null, etiquetas: [PICANTE] },
];

const IMAGEN_POR_SLUG: Readonly<Record<string, string>> = {
  pepperoni: 'images/pepperoni.jpg',
  margherita: 'images/margherita.jpg',
  diavola: 'images/diavola.jpg',
  verde: 'images/verde.jpg',
  carnivora: 'images/carnivora.jpg',
};

export const FILTROS_PRUEBA: MenuFiltrosResponse = {
  categorias: [CATEGORIA, BEBIDAS, SALSAS],
  etiquetas: [SIN_LACTEOS, VEGETARIANA, PICANTE],
  tamanos: [
    { id: 1, nombre: 'Personal', diametroCm: 22, personasMin: 1, personasMax: 1, precioBase: 18 },
    { id: 2, nombre: 'Mediana', diametroCm: 30, personasMin: 2, personasMax: 3, precioBase: 32 },
    { id: 3, nombre: 'Familiar', diametroCm: 40, personasMin: 4, personasMax: 5, precioBase: 48 },
  ],
};

export function tamanosDePrueba(producto: ProductoResumenResponse): readonly number[] {
  return producto.categoria === CATEGORIA.nombre ? PRECIOS.map((p) => p.tamanoId) : [];
}

export const MENU_PRUEBA: readonly ProductoResumenResponse[] = SEMILLAS.map((s): ProductoResumenResponse => ({
  id: s.id,
  nombre: s.nombre,
  slug: s.slug,
  descripcion: s.descripcion,
  imagenUrl: IMAGEN_POR_SLUG[s.slug] ?? null,
  precioDesde: PRECIOS[0].precio,
  categoria: CATEGORIA.nombre,
  disponible: true,
  destacado: s.destacado,
  calificacionPromedio: s.calificacion,
  totalResenas: s.resenas,
  ingredientes: s.ingredientes,
  etiquetas: s.etiquetas,
})).concat(
  SIMPLES.map((s): ProductoResumenResponse => ({
    id: s.id,
    nombre: s.nombre,
    slug: s.slug,
    descripcion: s.descripcion,
    imagenUrl: s.imagenUrl,
    precioDesde: s.precio,
    categoria: s.categoria.nombre,
    disponible: true,
    destacado: false,
    calificacionPromedio: 0,
    totalResenas: 0,
    ingredientes: null,
    etiquetas: s.etiquetas,
  })),
);

export function detallePrueba(slug: string): ProductoDetalleResponse | undefined {
  const simple = SIMPLES.find((s) => s.slug === slug);
  if (simple) {
    return {
      id: simple.id,
      categoria: simple.categoria,
      nombre: simple.nombre,
      slug: simple.slug,
      descripcion: simple.descripcion,
      imagenUrl: simple.imagenUrl,
      precioBase: simple.precio,
      requiereTamano: false,
      disponible: true,
      destacado: false,
      calificacionPromedio: 0,
      totalResenas: 0,
      ingredientes: null,
      etiquetas: simple.etiquetas,
      precios: [],
      tiposMasa: [],
      adicionales: [],
    };
  }
  const semilla = SEMILLAS.find((s) => s.slug === slug);
  if (!semilla) return undefined;
  return {
    id: semilla.id,
    categoria: CATEGORIA,
    nombre: semilla.nombre,
    slug: semilla.slug,
    descripcion: semilla.descripcion,
    imagenUrl: IMAGEN_POR_SLUG[semilla.slug] ?? null,
    precioBase: PRECIOS[0].precio,
    requiereTamano: true,
    disponible: true,
    destacado: semilla.destacado,
    calificacionPromedio: semilla.calificacion,
    totalResenas: semilla.resenas,
    ingredientes: semilla.ingredientes,
    etiquetas: semilla.etiquetas,
    precios: PRECIOS,
    tiposMasa: MASAS,
    adicionales: ADICIONALES,
  };
}
