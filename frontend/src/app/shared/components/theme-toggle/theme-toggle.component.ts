/**
 * Conmutador de tema claro/oscuro.
 * Menú desplegable con la preferencia actual del usuario.
 */
import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeMode, ThemeService } from '../../services/theme.service';

/**
 * ThemeToggle: botón con menú para elegir aspecto claro u oscuro.
 */
@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative shrink-0">
      <button type="button"
              (click)="toggleMenu()"
              class="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-line-strong text-ink-secondary hover:bg-muted transition-colors text-xs sm:text-sm"
              [attr.aria-expanded]="menuOpen"
              aria-label="Cambiar aspecto">
        @if (theme.isDark()) {
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
          </svg>
        } @else {
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
        }
        <span class="hidden sm:inline">{{ theme.modeLabel() }}</span>
      </button>

      @if (menuOpen) {
        <div class="absolute right-0 mt-1 w-44 bg-elevated border border-line rounded-xl shadow-xl z-50 p-2">
          <p class="text-[10px] font-bold uppercase tracking-wider text-ink-muted px-2 py-1">Aspecto</p>
          @for (opt of options; track opt.mode) {
            <button type="button"
                    (click)="select(opt.mode)"
                    class="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors"
                    [class.bg-primary-500]="theme.mode() === opt.mode"
                    [class.text-white]="theme.mode() === opt.mode"
                    [class.text-ink-secondary]="theme.mode() !== opt.mode"
                    [class.hover:bg-muted]="theme.mode() !== opt.mode">
              <span>{{ opt.label }}</span>
              @if (theme.mode() === opt.mode) {
                <span>✓</span>
              }
            </button>
          }
        </div>
      }
    </div>
  `,
})
/**
 * Controla la apertura del menú y delega el cambio de tema al ThemeService.
 */
export class ThemeToggleComponent {
  theme = inject(ThemeService);
  menuOpen = false;

  readonly options: { mode: ThemeMode; label: string }[] = [
    { mode: 'light', label: 'Claro' },
    { mode: 'dark', label: 'Oscuro' },
  ];

  /** Abre o cierra el menú de selección de aspecto. */
  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  /** Aplica el modo elegido y cierra el menú. */
  select(mode: ThemeMode): void {
    this.theme.setMode(mode);
    this.menuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('app-theme-toggle')) {
      this.menuOpen = false;
    }
  }
}
