import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LegalDocument, type SeccionLegal } from '../../shared/components/legal-document/legal-document';

const SECCIONES: readonly SeccionLegal[] = [
  {
    id: 'responsable',
    titulo: 'Quién usa tus datos',
    parrafos: [
      "Toto's Pizza es responsable del tratamiento de los datos que nos das al registrarte y pedir. Los tratamos conforme a la Ley de Protección de Datos Personales del Perú (Ley N.° 29733).",
    ],
  },
  {
    id: 'datos',
    titulo: 'Qué datos recopilamos',
    parrafos: ['Solo pedimos lo necesario para atender tu pedido:'],
    items: [
      'Datos de tu cuenta: nombres, apellidos, tipo y número de documento, fecha de nacimiento, teléfono y correo.',
      'Direcciones de entrega y su ubicación, para comprobar que estás dentro de la zona de reparto.',
      'Datos de tus pedidos: productos, horarios, estado y montos.',
      'Tu contraseña se guarda cifrada: nadie del equipo puede leerla.',
    ],
  },
  {
    id: 'finalidad',
    titulo: 'Para qué los usamos',
    parrafos: ['Usamos tus datos para:'],
    items: [
      'Crear y proteger tu cuenta.',
      'Preparar, entregar y darte seguimiento a tus pedidos.',
      'Contactarte si hay un problema con tu pedido o para recuperar tu contraseña.',
      'Atender reclamos y cumplir obligaciones legales y tributarias.',
    ],
  },
  {
    id: 'compartir',
    titulo: 'Con quién los compartimos',
    parrafos: [
      'No vendemos tus datos. Los compartimos solo con quienes participan en tu pedido: el personal de cocina y despacho ven lo que necesitan para prepararlo, y el motorizado recibe tu dirección y tu teléfono para entregarlo.',
      'También pueden tratarlos los proveedores del servicio de pagos y de correo, solo para esa función, y las autoridades cuando la ley lo exija.',
    ],
  },
  {
    id: 'seguridad',
    titulo: 'Cómo los protegemos',
    parrafos: [
      'Cada rol del equipo accede únicamente a lo que necesita para su trabajo. Las sesiones vencen solas y las contraseñas se almacenan cifradas.',
      'Los datos de tu tarjeta los procesa el servicio de pagos; nosotros no los guardamos.',
    ],
  },
  {
    id: 'derechos',
    titulo: 'Tus derechos',
    parrafos: [
      'Puedes acceder a tus datos, corregirlos, pedir que se eliminen u oponerte a su uso. Algunos datos de pedidos los conservamos el tiempo que exige la ley.',
      'Escríbenos desde el correo de tu cuenta y responderemos tu solicitud en los plazos que establece la ley.',
    ],
  },
  {
    id: 'cookies',
    titulo: 'Sesión y almacenamiento del navegador',
    parrafos: [
      'Guardamos tu sesión en el navegador para que no tengas que iniciar sesión en cada página. Si marcas "Recordarme", la sesión se conserva aunque cierres el navegador; si no, se borra al cerrarlo.',
    ],
  },
  {
    id: 'cambios',
    titulo: 'Cambios en esta política',
    parrafos: ['Si cambiamos esta política, publicaremos la nueva versión aquí con su fecha de actualización.'],
  },
];

@Component({
  selector: 'app-privacidad',
  imports: [LegalDocument],
  template: `
    <app-legal-document
      titulo="Política de privacidad"
      resumen="Qué datos guardamos de ti, para qué los usamos y cómo puedes controlarlos."
      actualizado="23 de noviembre de 2026"
      [secciones]="secciones"
      [relacionado]="{ etiqueta: 'Ver términos y condiciones', ruta: '/terminos' }"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Privacidad {
  protected readonly secciones = SECCIONES;
}
