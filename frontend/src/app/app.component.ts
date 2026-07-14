/**
 * =============================================================================
 * app/app.component.ts — Shell principal de la aplicación
 * =============================================================================
 * Componente raíz (selector: app-root). Define el layout global:
 *   - Navbar superior fija
 *   - Sidebar lateral (menú)
 *   - <router-outlet> donde Angular pinta la página de la URL actual
 *
 * El padding izquierdo en pantallas grandes (lg:pl-64) solo aparece si hay
 * sesión activa (auth.isLoggedIn()), para dejar espacio al menú lateral.
 * =============================================================================
 */

// Component = decorador que define un componente Angular.
// inject() = pide un servicio sin usar el constructor (estilo moderno).
import { Component, inject } from '@angular/core';

// RouterOutlet = directiva <router-outlet> que muestra el componente de la ruta activa.
import { RouterOutlet } from '@angular/router';

// Barra superior (logo, tema, notificaciones, logout).
import { NavbarComponent } from './shared/components/navbar/navbar.component';

// Menú lateral con enlaces según rol (talleres, salidas, etc.).
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';

// Sesión: token, rol, isLoggedIn() — usado para el padding del sidebar.
import { AuthRoleService } from './shared/services/auth-role.service';

// CommonModule = *ngIf, *ngFor, pipes básicos (por si el template los usa).
import { CommonModule } from '@angular/common';

@Component({
  // Nombre de la etiqueta HTML: <app-root> en index.html.
  selector: 'app-root',

  // standalone: true → no necesita NgModule; importa lo que usa abajo.
  standalone: true,

  // Piezas que este componente puede usar en su template.
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, CommonModule],

  // Template inline: estructura visual de TODA la app.
  template: `
    <!-- Contenedor a pantalla completa con fondo de página (tema claro/oscuro). -->
    <div class="min-h-screen bg-page">

      <!-- Barra superior fija (altura ~pt-14 / sm:pt-16 más abajo). -->
      <app-navbar></app-navbar>

      <!-- Menú lateral; se muestra/oculta según SidebarService. -->
      <app-sidebar></app-sidebar>

      <!--
        Área de contenido:
        - pt-14/sm:pt-16 = deja hueco bajo la navbar fija
        - [class.lg:pl-64] = en desktop, si hay sesión, empuja el contenido
          a la derecha para no quedar debajo del sidebar (64 = 16rem)
      -->
      <div class="flex flex-col min-h-screen w-full min-w-0 box-border pt-14 sm:pt-16 transition-all duration-300"
           [class.lg:pl-64]="auth.isLoggedIn()">

        <!-- Aquí Angular inserta la página de la URL actual (dashboard, login…). -->
        <main class="flex-1 w-full min-w-0 max-w-full overflow-x-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,

  // Sin estilos propios; todo va por Tailwind / CSS global.
  styles: [],
})
export class AppComponent {
  // Título de la app (disponible si algún hijo lo necesita).
  title = 'Reservas de Cancha';

  // Inyectamos AuthRoleService para leer isLoggedIn() en el template.
  auth = inject(AuthRoleService);
}
