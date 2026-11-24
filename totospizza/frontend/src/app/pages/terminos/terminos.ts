import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LegalDocument, type SeccionLegal } from '../../shared/components/legal-document/legal-document';

const SECCIONES: readonly SeccionLegal[] = [
  {
    id: 'aceptacion',
    titulo: 'Aceptación de los términos',
    parrafos: [
      "Al crear una cuenta o hacer un pedido en la web de Toto's Pizza aceptas estos términos. Si no estás de acuerdo con alguno, no uses el servicio.",
      'Para registrarte debes ser mayor de edad y dar datos verdaderos. Eres responsable de lo que se haga con tu cuenta, así que mantén tu contraseña en reserva.',
    ],
  },
  {
    id: 'catalogo',
    titulo: 'Catálogo, precios y alérgenos',
    parrafos: [
      'Mostramos cada producto con su descripción, ingredientes y etiquetas de alérgenos (por ejemplo "Contiene gluten" o "Sin lácteos"). Revisa siempre esa información antes de pagar.',
      'Los precios están en soles (S/) e incluyen impuestos. Pueden cambiar sin aviso, pero el precio que ves al confirmar tu pedido es el que pagas.',
      'Preparamos los alimentos en una cocina donde también hay gluten, lácteos y otros alérgenos, por lo que no podemos garantizar la ausencia total de trazas.',
    ],
  },
  {
    id: 'stock',
    titulo: 'Disponibilidad web',
    parrafos: [
      'Los pedidos web usan un stock propio, separado del que se vende en el local. Cuando se agota el stock del día, el producto deja de estar disponible en la web aunque el local aún tenga.',
      'Si un producto de tu carrito se agota antes de que pagues, te lo indicaremos para que lo cambies o lo quites.',
    ],
  },
  {
    id: 'pagos',
    titulo: 'Pagos',
    parrafos: [
      'Los pedidos se pagan únicamente en línea. No aceptamos pago contra entrega.',
      'El pedido empieza a prepararse cuando el pago se confirma. No manejamos cupones ni puntos de fidelidad.',
    ],
  },
  {
    id: 'entrega',
    titulo: 'Entrega y recojo',
    parrafos: [
      'Puedes elegir recojo en el local o delivery. El delivery solo está disponible dentro de nuestra zona de reparto, que verificamos con la ubicación de tu dirección.',
      'Mostramos un tiempo estimado con una cuenta regresiva y el estado de tu pedido: en preparación, en el horno, listo y en camino. Es una estimación: el tráfico o la demanda pueden moverla.',
      'Debes estar disponible en la dirección indicada. Si no podemos entregar por datos incorrectos o porque nadie recibe el pedido, es posible que no proceda el reembolso.',
    ],
  },
  {
    id: 'cancelaciones',
    titulo: 'Cancelaciones y reclamos',
    parrafos: [
      'Puedes cancelar tu pedido mientras no haya entrado a preparación. Después, la pizza ya está en marcha y no es posible cancelarla.',
      'Si tu pedido llega incompleto, equivocado o en mal estado, escríbenos el mismo día y lo resolveremos con una reposición o un reembolso, según el caso.',
      'También puedes presentar un reclamo en nuestro Libro de Reclamaciones virtual.',
    ],
  },
  {
    id: 'uso',
    titulo: 'Uso adecuado',
    parrafos: ['Al usar el sitio te comprometes a no:'],
    items: [
      'Dar datos falsos ni usar la cuenta de otra persona.',
      'Intentar acceder a áreas restringidas ni alterar el funcionamiento del sitio.',
      'Hacer pedidos de mala fe, como direcciones falsas.',
    ],
  },
  {
    id: 'cambios',
    titulo: 'Cambios en estos términos',
    parrafos: [
      'Podemos actualizar estos términos. Publicaremos la versión nueva en esta página con su fecha. Si sigues usando el servicio después del cambio, aceptas la versión vigente.',
    ],
  },
];

@Component({
  selector: 'app-terminos',
  imports: [LegalDocument],
  template: `
    <app-legal-document
      titulo="Términos y condiciones"
      resumen="Las reglas para comprar en Toto's Pizza: cómo pedimos, pagamos, entregamos y resolvemos cualquier problema."
      actualizado="23 de noviembre de 2026"
      [secciones]="secciones"
      [relacionado]="{ etiqueta: 'Ver política de privacidad', ruta: '/privacidad' }"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Terminos {
  protected readonly secciones = SECCIONES;
}
