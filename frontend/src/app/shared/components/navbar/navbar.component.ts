import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthRoleService } from '../../services/auth-role.service';
import { SidebarService } from '../../services/sidebar.service';
import { NavLinksComponent } from '../nav-links/nav-links.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, NavLinksComponent],
  template: `
    <nav class="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div class="px-3 sm:px-4">
        <div class="flex items-center gap-2 h-16">
          @if (auth.isLoggedIn()) {
            <button type="button"
                    (click)="sidebar.toggle()"
                    class="p-2 border border-gray-300 rounded-md hover:bg-gray-100 shrink-0 lg:hidden"
                    [attr.aria-expanded]="sidebar.isOpen"
                    aria-label="Abrir menú de navegación">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-6 h-6 text-gray-700">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            <button type="button"
                    (click)="sidebar.toggle()"
                    class="hidden lg:inline-flex p-2 border border-gray-300 rounded-md hover:bg-gray-100 shrink-0"
                    [attr.aria-expanded]="sidebar.isOpen"
                    aria-label="Mostrar u ocultar menú lateral">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-6 h-6 text-gray-700">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          }

          <a routerLink="/dashboard"
             class="text-base sm:text-lg font-bold text-primary-600 whitespace-nowrap shrink-0 min-w-0 truncate">
            🏆 Reservas de Cancha
          </a>

          @if (auth.isLoggedIn()) {
            <app-nav-links mode="navbar" />
          }

          <div class="flex items-center gap-2 sm:gap-3 ml-auto shrink-0">
            @if (auth.isLoggedIn()) {
              <span class="bg-primary-600 text-white text-xs sm:text-sm font-semibold px-2 sm:px-4 py-1.5 sm:py-2 rounded-full whitespace-nowrap max-w-[7rem] sm:max-w-none truncate">
                {{ auth.displayLabel() }}
              </span>
              <button type="button" (click)="cerrar()"
                      class="text-xs sm:text-sm text-gray-600 hover:text-primary-600 px-2 py-1 rounded whitespace-nowrap">
                Salir
              </button>
            } @else {
              <a routerLink="/login"
                 class="text-sm bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 font-medium">
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
