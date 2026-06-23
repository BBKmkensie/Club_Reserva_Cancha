import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { SidebarService } from '../../services/sidebar.service';
import { AuthRoleService } from '../../services/auth-role.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    @if (auth.isLoggedIn()) {
      <!-- Overlay solo en móvil cuando el panel está abierto -->
      @if (isOpen) {
        <div class="fixed inset-0 bg-black/40 z-30 lg:hidden"
             (click)="sidebarService.close()">
        </div>
      }

      <!-- Panel lateral: se muestra u oculta con el botón ☰ -->
      @if (isOpen) {
      <aside
        class="bg-white w-64 fixed left-0 top-16 z-40 border-r border-gray-200 overflow-y-auto shadow-sm"
        [style.height]="'calc(100vh - 4rem)'">
        <nav class="p-4 pt-5">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Accesos rápidos</p>
          <div class="space-y-2">
            <a routerLink="/inscripcion-talleres"
               routerLinkActive="bg-blue-50 text-blue-700 border-blue-400"
               [routerLinkActiveOptions]="{ exact: false }"
               class="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors border-l-4 border-yellow-400 bg-gray-50">
              <div class="flex items-center gap-3">
                <span class="text-2xl">📚</span>
                <span class="font-semibold text-gray-700 text-sm">Inscripción de Talleres</span>
              </div>
            </a>

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
  isOpen = false;
  private subscription?: Subscription;

  ngOnInit() {
    this.subscription = this.sidebarService.isOpen$.subscribe(isOpen => {
      this.isOpen = isOpen;
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
