import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { API_URL } from '../../../../core/config/api.config';
import { Login } from './login';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let host: HTMLElement;
  let http: HttpTestingController;

  beforeEach(async () => {
    sessionStorage.clear();
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    host = fixture.nativeElement;
    http = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  it('no envía nada si el formulario está vacío', () => {
    host.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    http.expectNone(`${TestBed.inject(API_URL)}/auth/login`);
    expect(true).toBe(true);
  });

  it('muestra el mensaje del backend cuando las credenciales son incorrectas', async () => {
    const form = (fixture.componentInstance as unknown as { form: { setValue: (v: unknown) => void } }).form;
    form.setValue({ correo: 'a@b.com', contrasena: 'x', recordarme: false });
    host.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();

    http.expectOne(`${TestBed.inject(API_URL)}/auth/login`).flush(
      { fecha: '', estado: 401, codigo: 'ACCESO_DENEGADO', mensaje: 'Correo o contraseña incorrectos.', ruta: '', errores: [] },
      { status: 401, statusText: 'Unauthorized' },
    );
    await fixture.whenStable();

    expect(host.querySelector('.alert')?.textContent).toContain('incorrectos');
  });
});
