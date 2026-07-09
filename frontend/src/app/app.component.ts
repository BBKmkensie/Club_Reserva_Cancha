/**
 * Componente raíz de la aplicación.
 * Define el layout principal con barra de navegación, sidebar y área de contenido.
 */
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { AuthRoleService } from './shared/services/auth-role.service';
import { CommonModule } from '@angular/common';

/**
 * Shell de la aplicación: navbar, sidebar condicional y router-outlet para las vistas.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, CommonModule],
  template: `
    <div class="min-h-screen bg-page overflow-x-hidden">
      <app-navbar></app-navbar>
      <app-sidebar></app-sidebar>
      <div class="flex flex-col min-h-screen w-full min-w-0 box-border pt-14 sm:pt-16 transition-all duration-300"
           [class.lg:pl-64]="auth.isLoggedIn()">
        <main class="flex-1 w-full min-w-0 max-w-full px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: []
})
export class AppComponent {
  title = 'Reservas de Cancha';
  auth = inject(AuthRoleService);
}
