/**
 * Tema visual de la aplicación (claro u oscuro).
 * Persiste la preferencia en localStorage y aplica la clase `dark` al documento.
 */
import { Injectable, signal, computed } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'app-theme';

/**
 * Servicio de tema que expone señales reactivas y sincroniza el modo con el DOM.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly modeSignal = signal<ThemeMode>(this.readStoredMode());
  readonly mode = this.modeSignal.asReadonly();
  readonly isDark = computed(() => this.modeSignal() === 'dark');

  constructor() {
    this.apply(this.modeSignal());
  }

  /** Establece el modo de tema y lo persiste en localStorage. */
  setMode(mode: ThemeMode): void {
    this.modeSignal.set(mode);
    localStorage.setItem(STORAGE_KEY, mode);
    this.apply(mode);
  }

  /** Alterna entre tema claro y oscuro. */
  toggleMode(): void {
    this.setMode(this.modeSignal() === 'light' ? 'dark' : 'light');
  }

  /** Etiqueta legible del modo para mostrar en la interfaz. */
  modeLabel(mode: ThemeMode = this.modeSignal()): string {
    return mode === 'light' ? 'Claro' : 'Oscuro';
  }

  private readStoredMode(): ThemeMode {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark') return 'dark';
    return 'light';
  }

  private apply(mode: ThemeMode): void {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }
}
