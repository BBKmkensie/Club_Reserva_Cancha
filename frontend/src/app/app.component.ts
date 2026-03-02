import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { SidebarService } from './shared/services/sidebar.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex">
      <app-sidebar></app-sidebar>
      <div class="flex-1 w-full transition-all duration-300" [class.ml-64]="sidebarOpen">
        <app-navbar></app-navbar>
        <main class="container mx-auto px-4 py-8">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: []
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Reservas de Cancha';
  sidebarOpen = false;
  private subscription?: Subscription;

  constructor(private sidebarService: SidebarService) {}

  ngOnInit() {
    this.subscription = this.sidebarService.isOpen$.subscribe(isOpen => {
      this.sidebarOpen = isOpen;
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}

