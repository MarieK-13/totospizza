import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Locales } from './locales';

describe('Locales', () => {
  let fixture: ComponentFixture<Locales>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Locales],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Locales);
    host = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('lista los locales de respaldo mientras la API no responde', () => {
    expect(host.querySelectorAll('[role="tab"]').length).toBe(3);
  });

  it('cambia el detalle al elegir otro local', async () => {
    const pestanas = host.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    pestanas[1].click();
    await fixture.whenStable();
    expect(host.querySelector('.detalle__nombre')?.textContent).toContain('Calle Lima');
    expect(pestanas[1].getAttribute('aria-selected')).toBe('true');
  });
});
