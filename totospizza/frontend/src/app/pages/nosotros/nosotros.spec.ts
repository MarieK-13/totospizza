import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Nosotros } from './nosotros';

describe('Nosotros', () => {
  let fixture: ComponentFixture<Nosotros>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Nosotros],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Nosotros);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('muestra las cuatro etapas del recorrido', () => {
    expect(fixture.nativeElement.querySelectorAll('.etapa').length).toBe(4);
  });
});
