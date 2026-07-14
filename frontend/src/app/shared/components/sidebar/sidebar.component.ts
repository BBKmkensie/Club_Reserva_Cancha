/**
 * =============================================================================
 * app/shared/components/sidebar/sidebar.component.ts — Menú lateral de navegación
 * =============================================================================
 * Barra lateral con enlaces principales, accesos rápidos contextuales y datos
 * de sesión. En móvil se despliega como panel deslizante; en escritorio queda
 * fijo a la izquierda. Se usa junto al navbar en el layout principal.
 *
 * Métodos clave: ngOnInit(), ngOnDestroy(), tieneAccesosRapidos(), cerrarSesion().
 * Inputs/Outputs: ninguno (lee permisos desde AuthRoleService).
 * =============================================================================
 */
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { SidebarService } from '../../services/sidebar.service';
import { AuthRoleService } from '../../services/auth-role.service';
import { NavLinksComponent } from '../nav-links/nav-links.component';
import { ApiService } from '../../../services/api.service';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NavLinksComponent, ThemeToggleComponent],
  template: `
    @if (auth.isLoggedIn()) {
      @if (isOpen) {
        <div class="fixed inset-0 bg-black/40 z-30 lg:hidden"
             (click)="sidebarService.close()">
        </div>
      }

      @if (isOpen) {
        <aside
          class="lg:hidden bg-surface w-72 max-w-[85vw] fixed left-0 top-14 sm:top-16 z-40 border-r border-line overflow-y-auto shadow-lg h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]">
          <nav class="p-4 pt-5">
            <p class="text-xs font-bold text-ink-muted uppercase tracking-wider mb-3 px-2">Menú</p>
            <app-nav-links mode="sidebar" (navigated)="sidebarService.close()" />
            <ng-container *ngTemplateOutlet="accesosRapidos" />
            <div class="mt-6 pt-4 border-t border-line px-2 space-y-3">
              @if (auth.currentNombre()) {
                <p class="text-xs text-ink-secondary font-semibold truncate" [title]="auth.currentNombre()!">
                  {{ auth.currentNombre() }}
                </p>
              }
              <p class="text-xs text-ink-muted">
                Rol: <span class="font-semibold text-ink-secondary">{{ auth.roleLabel() }}</span>
              </p>
              <div class="md:hidden">
                <app-theme-toggle />
              </div>
              <button type="button" (click)="cerrarSesion()"
                      class="w-full text-sm text-red-600 hover:text-red-700 border border-line-strong rounded-lg px-3 py-2 font-medium hover:bg-muted transition-colors">
                Cerrar sesión
              </button>
            </div>
          </nav>
        </aside>
      }

      <aside
        class="hidden lg:block bg-surface w-64 fixed left-0 top-14 sm:top-16 z-40 border-r border-line overflow-y-auto shadow-sm h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]">
        <nav class="p-4 pt-5 pb-8">
          <p class="text-xs font-bold text-ink-muted uppercase tracking-wider mb-3 px-2">Menú</p>
          <app-nav-links mode="sidebar" />
          <ng-container *ngTemplateOutlet="accesosRapidos" />
        </nav>
      </aside>
    }

    <ng-template #accesosRapidos>
      @if (tieneAccesosRapidos()) {
        <div class="mt-6 pt-4 border-t border-line">
          <p class="text-xs font-bold text-ink-muted uppercase tracking-wider mb-3 px-2">Accesos rápidos</p>
          <div class="space-y-2">
            @if (auth.canInscribirseTalleres()) {
              <a routerLink="/inscripcion-talleres"
                 routerLinkActive="!bg-primary-500/15 !text-primary-500 !border-palette-sky"
                 [routerLinkActiveOptions]="{ exact: false }"
                 class="block px-4 py-3 rounded-lg hover:bg-muted transition-colors border-l-4 border-yellow-400 bg-page">
                <div class="flex items-center gap-3">
                  <span class="text-2xl shrink-0">📚</span>
                  <span class="font-semibold text-ink-secondary text-sm">Inscripción de Talleres</span>
                </div>
              </a>

              @if (puedeVerMisSalidas) {
                <a routerLink="/mis-salidas"
                   routerLinkActive="!bg-primary-500/15 !text-primary-500 !border-palette-sky"
                   [routerLinkActiveOptions]="{ exact: false }"
                   class="block px-4 py-3 rounded-lg hover:bg-muted transition-colors border-l-4 border-yellow-400 bg-page">
                  <div class="flex items-center gap-3">
                    <span class="text-2xl shrink-0">🎫</span>
                    <span class="font-semibold text-ink-secondary text-sm">Mis salidas</span>
                  </div>
                </a>
              }
            }

            @if (auth.canGestionarSalidas()) {
              <a routerLink="/inscripcion-salidas"
                 routerLinkActive="!bg-primary-500/15 !text-primary-500 !border-palette-sky"
                 [routerLinkActiveOptions]="{ exact: false }"
                 class="block px-4 py-3 rounded-lg hover:bg-muted transition-colors border-l-4 border-yellow-400 bg-page">
                <div class="flex items-center gap-3">
                  <span class="text-2xl shrink-0">🚌</span>
                  <span class="font-semibold text-ink-secondary text-sm">Abrir Salidas</span>
                </div>
              </a>

              <a routerLink="/salidas"
                 routerLinkActive="!bg-primary-500/15 !text-primary-500 !border-palette-sky"
                 [routerLinkActiveOptions]="{ exact: false }"
                 class="block px-4 py-3 rounded-lg hover:bg-muted transition-colors border-l-4 border-yellow-400 bg-page">
                <div class="flex items-center gap-3">
                  <span class="text-2xl shrink-0">👁️</span>
                  <span class="font-semibold text-ink-secondary text-sm">Ver Salidas</span>
                </div>
              </a>
            }
          </div>
        </div>
      }
    </ng-template>
  `,
  styles: [],
})
export class SidebarComponent implements OnInit, OnDestroy {
  /** Rol y permisos para mostrar accesos rápidos y datos de sesión. */
  auth = inject(AuthRoleService);
  /** Estado abierto/cerrado del panel móvil (compartido con el navbar). */
  sidebarService = inject(SidebarService);
  /** Consulta si el alumno tiene inscripciones aceptadas (enlace Mis salidas). */
  private api = inject(ApiService);
  /** Redirección al login al cerrar sesión. */
  private router = inject(Router);
  /** Espejo local de sidebarService.isOpen$ para el template. */
  isOpen = false;
  /** true si el alumno tiene al menos una inscripción ACEPTADO → muestra Mis salidas. */
  puedeVerMisSalidas = false;
  /** Suscripción al observable de apertura; se libera en ngOnDestroy. */
  private subscription?: Subscription;

  /**
   * Suscribe al estado de apertura del sidebar (SidebarService) y consulta
   * al backend si el alumno tiene inscripciones aceptadas para mostrar «Mis salidas».
   */
  ngOnInit() {
    this.subscription = this.sidebarService.isOpen$.subscribe(isOpen => {
      this.isOpen = isOpen;
    });
    this.actualizarMisSalidas();
  }

  /**
   * Indica si debe mostrarse la sección de accesos rápidos.
   * Visible para alumnos (inscripción a talleres) o roles que gestionan salidas.
   */
  tieneAccesosRapidos(): boolean {
    return this.auth.canInscribirseTalleres() || this.auth.canGestionarSalidas();
  }

  /** Determina si el alumno puede ver el enlace «Mis salidas» según inscripciones aceptadas. */
  private actualizarMisSalidas(): void {
    if (!this.auth.canInscribirseTalleres()) {
      this.puedeVerMisSalidas = false;
      return;
    }
    const alumnoId = this.auth.currentUserId();
    if (!alumnoId) {
      this.puedeVerMisSalidas = false;
      return;
    }
    this.api.getInscripcionesTallerPorAlumno(alumnoId).subscribe({
      next: (inscs) => {
        this.puedeVerMisSalidas = (inscs ?? []).some(
          (i: { estado: string }) => String(i.estado).toUpperCase() === 'ACEPTADO',
        );
      },
      error: () => {
        this.puedeVerMisSalidas = false;
      },
    });
  }

  /** Libera la suscripción al observable del sidebar al destruir el componente. */
  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  /**
   * Cierra la sesión del usuario, oculta el menú móvil y redirige al login.
   */
  cerrarSesion(): void {
    this.auth.clear();
    this.sidebarService.close();
    this.router.navigate(['/login']);
  }
}
