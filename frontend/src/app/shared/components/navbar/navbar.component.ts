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
      <div class="px-3 sm:px-4 lg:px-6">
        <div class="flex items-center gap-2 sm:gap-3 h-14 sm:h-16 min-w-0">
          @if (auth.isLoggedIn()) {
            <button type="button"
                    (click)="sidebar.toggle()"
                    class="p-2 border border-line-strong rounded-md hover:bg-muted shrink-0 lg:hidden"
                    [attr.aria-expanded]="sidebar.isOpen"
                    aria-label="Abrir menú de navegación">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-6 h-6 text-ink-secondary">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          }

          <app-logo-nauta variant="navbar" />

          <div class="flex items-center gap-2 sm:gap-3 ml-auto shrink-0">
            @if (auth.isLoggedIn()) {
              <app-notificaciones-panel />
            }
            <app-theme-toggle />

            @if (auth.isLoggedIn()) {
              <div class="flex items-center gap-2 min-w-0">
                @if (auth.currentNombre()) {
                  <span class="hidden sm:inline text-sm text-ink-secondary font-medium truncate max-w-[8rem] md:max-w-[12rem] lg:max-w-[16rem]"
                        [title]="auth.currentNombre()!">
                    {{ auth.currentNombre() }}
                  </span>
                }
                <span class="bg-primary-500 text-white text-xs sm:text-sm font-semibold px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full whitespace-nowrap shrink-0">
                  {{ auth.roleLabel() }}
                </span>
              </div>
              <button type="button" (click)="cerrar()"
                      class="text-xs sm:text-sm text-ink-muted hover:text-primary-500 px-2 py-1 rounded whitespace-nowrap">
                Salir
              </button>
            } @else {
              <a routerLink="/login"
                 class="text-sm bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 font-medium whitespace-nowrap">
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
  auth = inject(AuthRoleService);
  sidebar = inject(SidebarService);
  private router = inject(Router);

  cerrar(): void {
    this.auth.clear();
    this.router.navigate(['/login']);
  }
}
