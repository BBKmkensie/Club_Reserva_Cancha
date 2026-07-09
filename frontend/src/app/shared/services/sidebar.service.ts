/**
 * Estado del panel lateral de navegación (sidebar).
 * Controla apertura/cierre reactivo según el ancho de pantalla y acciones del usuario.
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Servicio que gestiona la visibilidad del sidebar en la aplicación.
 * Expone un observable para que los componentes reaccionen a cambios de estado.
 */
@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private isOpenSubject = new BehaviorSubject<boolean>(this.defaultOpen());
  public isOpen$ = this.isOpenSubject.asObservable();

  private defaultOpen(): boolean {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 1024;
  }

  /** Alterna entre abierto y cerrado. */
  toggle() {
    this.isOpenSubject.next(!this.isOpenSubject.value);
  }

  /** Abre el sidebar. */
  open() {
    this.isOpenSubject.next(true);
  }

  /** Cierra el sidebar. */
  close() {
    this.isOpenSubject.next(false);
  }

  /** Indica si el sidebar está abierto en este momento. */
  get isOpen(): boolean {
    return this.isOpenSubject.value;
  }
}
