import { nivelDeSeguridad } from './password-strength';

describe('nivelDeSeguridad', () => {
  it('vacío = nivel 0', () => expect(nivelDeSeguridad('').nivel).toBe(0));
  it('débil si no cumple el backend', () => expect(nivelDeSeguridad('abc').etiqueta).toBe('Débil'));
  it('regular si cumple lo mínimo', () => expect(nivelDeSeguridad('clave1234').etiqueta).toBe('Regular'));
  it('fuerte si es larga y variada', () => expect(nivelDeSeguridad('Clave1234567!').etiqueta).toBe('Fuerte'));
});
