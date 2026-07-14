/**
 * =============================================================================
 * app/shared/services/sidebar.service.ts — Estado del menú lateral
 * =============================================================================
 * Controla apertura/cierre del sidebar con un BehaviorSubject (isOpen$).
 *
 * Por defecto:
 *   - abierto en pantallas >= 1024 px (breakpoint lg de Tailwind)
 *   - cerrado en móvil
 *
 * Usado por app-sidebar y app-navbar para sincronizar el botón hamburguesa.
 * =============================================================================
 */

import { Injectable } from '@angular/core';

// BehaviorSubject = Observable que siempre tiene un valor actual
// (quien se suscribe recibe el último estado de inmediato).
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  // Estado interno: true = sidebar abierto, false = cerrado.
  // Se inicializa según el ancho de la ventana.
  private isOpenSubject = new BehaviorSubject<boolean>(this.defaultOpen());

  /**
   * Observable público: los componentes hacen
   *   sidebar.isOpen$.subscribe(abierto => …)
   * o async pipe en el template.
   */
  public isOpen$ = this.isOpenSubject.asObservable();

  /**
   * Valor inicial según viewport.
   * Sin window (SSR) → abierto. Desktop (>=1024) → abierto. Móvil → cerrado.
   */
  private defaultOpen(): boolean {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 1024;
  }

  /** Alterna entre abierto y cerrado (botón hamburguesa). */
  toggle() {
    this.isOpenSubject.next(!this.isOpenSubject.value);
  }

  /** Fuerza el sidebar abierto. */
  open() {
    this.isOpenSubject.next(true);
  }

  /** Fuerza el sidebar cerrado (útil al navegar en móvil). */
  close() {
    this.isOpenSubject.next(false);
  }

  /** Lectura síncrona del estado actual (sin suscribirse). */
  get isOpen(): boolean {
    return this.isOpenSubject.value;
  }
}
