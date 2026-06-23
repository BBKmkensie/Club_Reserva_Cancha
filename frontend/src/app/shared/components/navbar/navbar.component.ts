import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthRoleService } from '../../services/auth-role.service';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div class="px-3 sm:px-4">
        <div class="flex items-center gap-2 h-16">
          @if (auth.isLoggedIn()) {
            <button type="button"
                    (click)="sidebar.toggle()"
                    class="p-2 border border-gray-300 rounded-md hover:bg-gray-100 shrink-0"
                    [attr.aria-expanded]="sidebar.isOpen"
                    aria-label="Mostrar u ocultar menú lateral">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-6 h-6 text-gray-700">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          }

          <a routerLink="/dashboard"
             class="text-base sm:text-lg font-bold text-primary-600 whitespace-nowrap shrink-0">
            🏆 Reservas de Cancha
          </a>

          @if (auth.isLoggedIn()) {
            <div class="hidden lg:flex flex-1 items-center gap-1 overflow-x-auto nav-scroll min-w-0 px-2">
              <a routerLink="/dashboard" routerLinkActive="nav-active" class="nav-link">Dashboard</a>
              <a routerLink="/talleres" routerLinkActive="nav-active" class="nav-link">Talleres</a>
              @if (auth.canGestionarAsistencia()) {
                <a routerLink="/control-asistencia" routerLinkActive="nav-active" class="nav-link">Control de asistencia</a>
              }
              @if (auth.canVerFichasAlumnos()) {
                <a routerLink="/fichas-alumnos" routerLinkActive="nav-active" class="nav-link">Fichas alumnos</a>
              }
              @if (auth.canVerAlumnos()) {
                <a routerLink="/alumnos" routerLinkActive="nav-active" class="nav-link">Alumnos</a>
              }
              @if (auth.canVerProfesores()) {
                <a routerLink="/profesores" routerLinkActive="nav-active" class="nav-link">Profesores</a>
              }
              @if (auth.canReservarCancha()) {
                <a routerLink="/reservas" routerLinkActive="nav-active" class="nav-link">Reservas</a>
              }
              @if (auth.canGestionarSalidas()) {
                <a routerLink="/inscripcion-salidas" routerLinkActive="nav-active" class="nav-link">Abrir salidas</a>
                <a routerLink="/salidas" routerLinkActive="nav-active" class="nav-link">Salidas</a>
              }
              @if (auth.canVerReportesAsistencia()) {
                <a routerLink="/reportes-asistencia" routerLinkActive="nav-active" class="nav-link">Reportes asistencia</a>
              }
              @if (auth.canVerComparacionSemestre()) {
                <a routerLink="/comparacion-semestre" routerLinkActive="nav-active" class="nav-link">Comparación semestre</a>
              }
              @if (auth.canVerAdmins()) {
                <a routerLink="/admins" routerLinkActive="nav-active" class="nav-link">Administradores</a>
              }
              @if (auth.canInscribirseTalleres()) {
                <a routerLink="/inscripcion-talleres" routerLinkActive="nav-active" class="nav-link">Inscribirme a taller</a>
                <a routerLink="/mis-salidas" routerLinkActive="nav-active" class="nav-link">Mis salidas</a>
              }
            </div>
          }

          <div class="flex items-center gap-2 sm:gap-3 ml-auto shrink-0">
            @if (auth.isLoggedIn()) {
              <span class="bg-primary-600 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full whitespace-nowrap">
                {{ auth.displayLabel() }}
              </span>
              <button type="button" (click)="cerrar()"
                      class="text-xs sm:text-sm text-gray-600 hover:text-primary-600 px-2 py-1 rounded whitespace-nowrap">
                Cerrar sesión
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
  styles: [`
    .nav-link {
      @apply text-gray-700 hover:text-primary-600 px-2.5 py-2 rounded-md transition whitespace-nowrap text-sm;
    }
    .nav-active {
      @apply text-primary-600 font-semibold;
    }
    .nav-scroll {
      scrollbar-width: thin;
    }
  `]
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
