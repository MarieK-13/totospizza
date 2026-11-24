import { FormControl, FormGroup } from '@angular/forms';
import { documentoValidator, fechaPasadaValidator } from './documento';

describe('documentoValidator', () => {
  const crear = (tipo: string, numero: string) => {
    const numeroDocumento = new FormControl(numero, documentoValidator());
    new FormGroup({ tipoDocumento: new FormControl(tipo), numeroDocumento });
    numeroDocumento.updateValueAndValidity();
    return numeroDocumento;
  };

  it('acepta un DNI de 8 dígitos', () => expect(crear('DNI', '12345678').valid).toBe(true));
  it('rechaza un DNI corto', () => expect(crear('DNI', '123').errors?.['documento']).toBeTruthy());
  it('exige 9 dígitos para carné de extranjería', () => {
    expect(crear('CE', '12345678').valid).toBe(false);
    expect(crear('CE', '123456789').valid).toBe(true);
  });
  it('acepta pasaporte alfanumérico', () => expect(crear('PASAPORTE', 'AB123456').valid).toBe(true));
});

describe('fechaPasadaValidator', () => {
  it('rechaza hoy y fechas futuras', () => {
    const hoy = new Date().toISOString().slice(0, 10);
    expect(fechaPasadaValidator(new FormControl(hoy))).toBeTruthy();
  });
  it('acepta una fecha pasada', () => expect(fechaPasadaValidator(new FormControl('2000-05-10'))).toBeNull());
});
