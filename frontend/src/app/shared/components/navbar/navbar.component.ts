/**
 * =============================================================================
 * app/shared/components/navbar/navbar.component.ts — Barra de navegación superior
 * =============================================================================
 * Barra fija en la parte superior de la aplicación. Muestra el logo, botón de
 * menú móvil, panel de notificaciones, conmutador de tema, etiqueta de rol y
 * acción de cierre de sesión. Se usa en el layout principal (app.component).
 *
 * Métodos clave: roleCorto(), cerrar().
 * Servicios: AuthRoleService, SidebarService, Router.
 * =============================================================================
 */
import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthRoleService } from '../../services/auth-role.service';
import { SidebarService } from '../../services/sidebar.service';
import { LogoNautaComponent } from '../logo-nauta/logo-nauta.component';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { NotificacionesPanelComponent } from '../notificaciones-panel/notificaciones-panel.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, LogoNautaComponent, ThemeToggleComponent, NotificacionesPanelComponent],
  template: `
    <nav class="fixed top-0 left-0 right-0 z-50 bg-elevated shadow-lg border-b border-line">
      <div class="px-2 sm:px-4 lg:px-6 max-w-full">
        <div class="flex items-center gap-1 sm:gap-2 h-14 sm:h-16 min-w-0 w-full">
          <div class="flex items-center gap-1 sm:gap-2 min-w-0 flex-1 overflow-hidden">
            @if (auth.isLoggedIn()) {
              <button type="button"
                      (click)="sidebar.toggle()"
                      class="p-1.5 sm:p-2 border border-line-strong rounded-md hover:bg-muted shrink-0 lg:hidden"
                      [attr.aria-expanded]="sidebar.isOpen"
                      aria-label="Abrir menú de navegación">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-5 h-5 sm:w-6 sm:h-6 text-ink-secondary">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
            }

            <app-logo-nauta variant="navbar" />
          </div>

          <div class="flex items-center gap-1 sm:gap-2 shrink-0">
            @if (auth.isLoggedIn()) {
              <app-notificaciones-panel />
              <div class="hidden md:block">
                <app-theme-toggle />
              </div>

              <div class="flex items-center gap-1 sm:gap-2 min-w-0">
                @if (auth.currentNombre()) {
                  <span class="hidden lg:inline text-sm text-ink-secondary font-medium truncate max-w-[8rem] xl:max-w-[16rem]"
                        [title]="auth.currentNombre()!">
                    {{ auth.currentNombre() }}
                  </span>
                }
                <span class="bg-primary-500 text-white text-[10px] sm:text-xs md:text-sm font-semibold px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 md:py-2 rounded-full whitespace-nowrap shrink-0 max-w-[5.5rem] sm:max-w-none truncate"
                      [title]="auth.roleLabel()">
                  <span class="sm:hidden">{{ roleCorto() }}</span>
                  <span class="hidden sm:inline">{{ auth.roleLabel() }}</span>
                </span>
              </div>

              <button type="button" (click)="cerrar()"
                      class="shrink-0 text-[11px] sm:text-sm text-ink-muted hover:text-primary-500 px-1.5 sm:px-2 py-1 rounded whitespace-nowrap border border-transparent hover:border-line-strong"
                      aria-label="Cerrar sesión">
                Salir
              </button>
            } @else {
              <div class="hidden sm:block">
                <app-theme-toggle />
              </div>
              <a routerLink="/login"
                 class="text-xs sm:text-sm bg-primary-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-primary-600 font-medium whitespace-nowrap shrink-0">
                Iniciar sesión
              </a>
            }
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: []
})
export class NavbarComponent {
  /** Sesión: nombre, rol, isLoggedIn(), clear(). */
  auth = inject(AuthRoleService);
  /** Abre/cierra el menú lateral en móvil (botón hamburguesa). */
  sidebar = inject(SidebarService);
  /** Redirección a /login al cerrar sesión. */
  private router = inject(Router);

  /**
   * Devuelve una etiqueta abreviada del rol del usuario para pantallas pequeñas
   * (ej. «Profesor» → «Prof.»), evitando que el badge se desborde en móvil.
   */
  roleCorto(): string {
    const map: Record<string, string> = {
      Estudiante: 'Est.',
      Profesor: 'Prof.',
      Apoderado: 'Apod.',
      Directiva: 'Dir.',
      'Super Admin': 'Admin',
    };
    return map[this.auth.roleLabel()] ?? this.auth.roleLabel();
  }

  /**
   * Cierra la sesión del usuario (limpia token y rol en localStorage)
   * y redirige a la pantalla de login.
   */
  cerrar(): void {
    this.auth.clear();
    this.router.navigate(['/login']);
  }
}
