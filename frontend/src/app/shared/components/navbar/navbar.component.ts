import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthRoleService, AppRole } from '../../services/auth-role.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="bg-white shadow-lg">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center space-x-4 lg:space-x-8">
            <a routerLink="/dashboard" class="text-xl font-bold text-primary-600 whitespace-nowrap flex-shrink-0">
              🏆 Reservas de Cancha
            </a>
            @if (auth.currentRole()) {
              <div class="hidden md:flex space-x-4">
                <a routerLink="/dashboard" routerLinkActive="text-primary-600 font-semibold"
                   class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md transition">
                  Dashboard
                </a>
                <a routerLink="/talleres" routerLinkActive="text-primary-600 font-semibold"
                   class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md transition">
                  Talleres
                </a>
                @if (auth.isAdmin() && auth.currentTallerId()) {
                  <a [routerLink]="['/taller', auth.currentTallerId()]" routerLinkActive="text-primary-600 font-semibold"
                     class="text-amber-700 hover:text-amber-800 px-3 py-2 rounded-md transition font-medium">
                    Solicitudes de mi taller
                  </a>
                }
                @if (auth.canVerAlumnos()) {
                  <a routerLink="/alumnos" routerLinkActive="text-primary-600 font-semibold"
                     class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md transition">
                    Alumnos
                  </a>
                }
                @if (auth.canVerProfesores()) {
                  <a routerLink="/profesores" routerLinkActive="text-primary-600 font-semibold"
                     class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md transition">
                    Profesores
                  </a>
                }
                @if (auth.canReservarCancha()) {
                  <a routerLink="/reservas" routerLinkActive="text-primary-600 font-semibold"
                     class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md transition">
                    Reservas
                  </a>
                }
                @if (auth.canGestionarSalidas()) {
                  <a routerLink="/inscripcion-salidas" routerLinkActive="text-primary-600 font-semibold"
                     class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md transition">
                    Abrir salidas
                  </a>
                  <a routerLink="/salidas" routerLinkActive="text-primary-600 font-semibold"
                     class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md transition">
                    Salidas
                  </a>
                }
                @if (auth.canInscribirseTalleres()) {
                  <a routerLink="/inscripcion-talleres" routerLinkActive="text-primary-600 font-semibold"
                     class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md transition">
                    Inscribirme a taller
                  </a>
                  <a routerLink="/mis-salidas" routerLinkActive="text-primary-600 font-semibold"
                     class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md transition">
                    Mis salidas
                  </a>
                }
                @if (auth.canVerAdmins()) {
                  <a routerLink="/admins" routerLinkActive="text-primary-600 font-semibold"
                     class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md transition">
                    Administradores
                  </a>
                }
              </div>
            }
          </div>
          <div class="flex items-center gap-3">
            @if (auth.currentRole(); as role) {
              <span class="text-sm text-gray-500">
                {{ roleLabel(role) }}
              </span>
              <button (click)="cerrar()"
                      class="text-sm text-gray-600 hover:text-primary-600 px-2 py-1 rounded">
                Cerrar sesión
              </button>
            } @else {
              <a routerLink="/login"
                 class="text-sm bg-primary-600 text-white px-3 py-1.5 rounded hover:bg-primary-700">
                Entrar
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
  private router = inject(Router);

  roleLabel(role: AppRole): string {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Profesor';
      case 'usuario': return 'Estudiante';
      default: return '';
    }
  }

  cerrar(): void {
    this.auth.clear();
    this.router.navigate(['/login']);
  }
}
