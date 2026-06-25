import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { SidebarService } from '../../services/sidebar.service';
import { AuthRoleService } from '../../services/auth-role.service';
import { NavLinksComponent } from '../nav-links/nav-links.component';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NavLinksComponent],
  template: `
    @if (auth.isLoggedIn()) {
      @if (isOpen) {
        <div class="fixed inset-0 bg-black/40 z-30 lg:hidden"
             (click)="sidebarService.close()">
        </div>
      }

      @if (isOpen) {
        <!-- Móvil: menú completo (equivalente a la navbar) -->
        <aside
          class="lg:hidden bg-white w-72 max-w-[85vw] fixed left-0 top-16 z-40 border-r border-gray-200 overflow-y-auto shadow-lg"
          [style.height]="'calc(100vh - 4rem)'">
          <nav class="p-4 pt-5">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Menú</p>
            <app-nav-links mode="sidebar" (navigated)="sidebarService.close()" />
            <div class="mt-6 pt-4 border-t border-gray-100 px-2">
              <p class="text-xs text-gray-500">
                Rol: <span class="font-semibold text-gray-700">{{ auth.displayLabel() }}</span>
              </p>
            </div>
          </nav>
        </aside>

        <!-- Escritorio: solo accesos rápidos (la navbar ya tiene el menú completo) -->
        <aside
          class="hidden lg:block bg-white w-64 fixed left-0 top-16 z-40 border-r border-gray-200 overflow-y-auto shadow-sm"
          [style.height]="'calc(100vh - 4rem)'">
          <nav class="p-4 pt-5">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Accesos rápidos</p>
            <div class="space-y-2">
              @if (auth.canInscribirseTalleres()) {
                <a routerLink="/inscripcion-talleres"
                   routerLinkActive="bg-blue-50 text-blue-700 border-blue-400"
                   [routerLinkActiveOptions]="{ exact: false }"
                   class="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors border-l-4 border-yellow-400 bg-gray-50">
                  <div class="flex items-center gap-3">
                    <span class="text-2xl">📚</span>
                    <span class="font-semibold text-gray-700 text-sm">Inscripción de Talleres</span>
                  </div>
                </a>

                @if (puedeVerMisSalidas) {
                  <a routerLink="/mis-salidas"
                     routerLinkActive="bg-blue-50 text-blue-700 border-blue-400"
                     [routerLinkActiveOptions]="{ exact: false }"
                     class="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors border-l-4 border-yellow-400 bg-gray-50">
                    <div class="flex items-center gap-3">
                      <span class="text-2xl">🎫</span>
                      <span class="font-semibold text-gray-700 text-sm">Mis salidas</span>
                    </div>
                  </a>
                }
              }

              @if (auth.canGestionarSalidas()) {
                <a routerLink="/inscripcion-salidas"
                   routerLinkActive="bg-blue-50 text-blue-700 border-blue-400"
                   [routerLinkActiveOptions]="{ exact: false }"
                   class="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors border-l-4 border-yellow-400 bg-gray-50">
                  <div class="flex items-center gap-3">
                    <span class="text-2xl">🚌</span>
                    <span class="font-semibold text-gray-700 text-sm">Abrir Salidas</span>
                  </div>
                </a>

                <a routerLink="/salidas"
                   routerLinkActive="bg-blue-50 text-blue-700 border-blue-400"
                   [routerLinkActiveOptions]="{ exact: false }"
                   class="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors border-l-4 border-yellow-400 bg-gray-50">
                  <div class="flex items-center gap-3">
                    <span class="text-2xl">👁️</span>
                    <span class="font-semibold text-gray-700 text-sm">Ver Salidas</span>
                  </div>
                </a>
              }
            </div>
          </nav>
        </aside>
      }
    }
  `,
  styles: []
})
export class SidebarComponent implements OnInit, OnDestroy {
  auth = inject(AuthRoleService);
  sidebarService = inject(SidebarService);
  private api = inject(ApiService);
  isOpen = false;
  puedeVerMisSalidas = false;
  private subscription?: Subscription;

  ngOnInit() {
    this.subscription = this.sidebarService.isOpen$.subscribe(isOpen => {
      this.isOpen = isOpen;
    });
    this.actualizarMisSalidas();
  }

  private actualizarMisSalidas(): void {
    if (!this.auth.canInscribirseTalleres()) {
      this.puedeVerMisSalidas = false;
      return;
    }
    const alumnoId = this.auth.currentUserId();
    if (!alumnoId) {
      this.puedeVerMisSalidas = !!this.auth.currentTallerId();
      return;
    }
    this.api.getInscripcionesTallerPorAlumno(alumnoId).subscribe({
      next: (inscs) => {
        const aceptadas = (inscs ?? []).some((i: { estado: string }) => i.estado === 'ACEPTADO');
        this.puedeVerMisSalidas = aceptadas || !!this.auth.currentTallerId();
      },
      error: () => {
        this.puedeVerMisSalidas = !!this.auth.currentTallerId();
      },
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
