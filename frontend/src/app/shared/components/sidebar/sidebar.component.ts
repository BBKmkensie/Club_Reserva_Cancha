import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Overlay para móviles -->
    <div *ngIf="isOpen" 
         class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity"
         (click)="toggleSidebar()">
    </div>

    <!-- Header del Sidebar - Siempre visible -->
    <div class="bg-white p-4 border-b border-gray-200 flex items-center fixed left-0 top-0 z-40 w-64">
      <button (click)="toggleSidebar()" 
              class="p-2 hover:bg-gray-100 rounded-md transition-colors">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-6 h-6 text-gray-700 hover:text-gray-900">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
    </div>

    <!-- Contenido del Sidebar - Se oculta/muestra -->
    <aside [class]="'bg-white w-64 min-h-screen fixed left-0 top-16 z-40 transition-transform duration-300 shadow-lg overflow-y-auto ' + (isOpen ? 'translate-x-0' : '-translate-x-full')">
      <nav class="p-4">
        <div class="space-y-2">
          <!-- Inscripción de Talleres -->
          <a routerLink="/inscripcion-talleres" 
             routerLinkActive="bg-blue-50 text-blue-600"
             [routerLinkActiveOptions]="{exact: false}"
             class="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border-l-4 border-yellow-400 bg-gray-50">
            <div class="flex items-center gap-3">
              <span class="text-2xl">📚</span>
              <span class="font-semibold text-gray-700">Inscripción de Talleres</span>
            </div>
          </a>

          <!-- Inscripción de Salidas -->
          <a routerLink="/inscripcion-salidas" 
             routerLinkActive="bg-blue-50 text-blue-600"
             [routerLinkActiveOptions]="{exact: false}"
             class="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border-l-4 border-yellow-400 bg-gray-50">
            <div class="flex items-center gap-3">
              <span class="text-2xl">🚌</span>
              <span class="font-semibold text-gray-700">Inscripción de Salidas</span>
            </div>
          </a>
        </div>
      </nav>
    </aside>
  `,
  styles: []
})
export class SidebarComponent implements OnInit, OnDestroy {
  isOpen = false;
  private subscription?: Subscription;

  constructor(private sidebarService: SidebarService) {}

  ngOnInit() {
    this.subscription = this.sidebarService.isOpen$.subscribe(isOpen => {
      this.isOpen = isOpen;
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  toggleSidebar() {
    this.sidebarService.toggle();
  }
}

