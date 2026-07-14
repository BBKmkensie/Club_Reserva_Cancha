/**
 * =============================================================================
 * app/shared/services/theme.service.ts — Tema claro / oscuro
 * =============================================================================
 * Gestiona el modo visual de la aplicación (light | dark).
 *
 * - Persiste la preferencia en localStorage (clave 'app-theme')
 * - Aplica la clase CSS 'dark' en <html> (document.documentElement)
 *   para que Tailwind dark:… funcione
 *
 * Usado por el toggle de tema en la navbar.
 * =============================================================================
 */

// signal = estado reactivo; computed = derivado (isDark).
import { Injectable, signal, computed } from '@angular/core';

/** Únicos valores válidos del tema. */
export type ThemeMode = 'light' | 'dark';

// Clave en localStorage donde guardamos 'light' o 'dark'.
const STORAGE_KEY = 'app-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  // Signal privada con el modo actual (se lee del storage al crear el servicio).
  private readonly modeSignal = signal<ThemeMode>(this.readStoredMode());

  /** Modo actual en solo lectura (para templates / otros servicios). */
  readonly mode = this.modeSignal.asReadonly();

  /** true si el tema activo es oscuro (atajo para *ngIf / class). */
  readonly isDark = computed(() => this.modeSignal() === 'dark');

  /**
   * Al construir el servicio, aplicamos la clase 'dark' al <html>
   * según lo que haya en localStorage (o light por defecto).
   */
  constructor() {
    this.apply(this.modeSignal());
  }

  /**
   * Cambia el tema, lo guarda en localStorage y actualiza el DOM.
   * mode = 'light' | 'dark'
   */
  setMode(mode: ThemeMode): void {
    this.modeSignal.set(mode);
    localStorage.setItem(STORAGE_KEY, mode);
    this.apply(mode);
  }

  /** Alterna: si está en claro → oscuro, y viceversa. */
  toggleMode(): void {
    this.setMode(this.modeSignal() === 'light' ? 'dark' : 'light');
  }

  /**
   * Etiqueta en español para mostrar en la UI ("Claro" / "Oscuro").
   * Si no pasas mode, usa el actual.
   */
  modeLabel(mode: ThemeMode = this.modeSignal()): string {
    return mode === 'light' ? 'Claro' : 'Oscuro';
  }

  /**
   * Lee localStorage. Si no hay window (SSR) o no hay valor válido → 'light'.
   */
  private readStoredMode(): ThemeMode {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark') return 'dark';
    return 'light';
  }

  /**
   * Aplica o quita la clase 'dark' en <html>.
   * Tailwind usa esa clase para activar variantes dark:…
   */
  private apply(mode: ThemeMode): void {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }
}
