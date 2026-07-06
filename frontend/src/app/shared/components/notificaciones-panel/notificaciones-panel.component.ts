import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { NotificacionPollService } from '../../services/notificacion-poll.service';
import { AuthRoleService } from '../../services/auth-role.service';
import { rutaDesdeNotificacion } from '../../utils/notificacion-nav.util';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notificaciones-panel',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    @if (auth.isLoggedIn() && activo) {
      <div class="relative shrink-0">
        <button type="button"
                (click)="toggle()"
                class="relative p-2 rounded-lg border border-line-strong hover:bg-muted transition-colors"
                [attr.aria-expanded]="abierto"
                aria-label="Notificaciones">
          <svg class="w-5 h-5 text-ink-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
          @if (noLeidas > 0) {
            <span class="absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-palette-magenta text-white text-[10px] font-bold flex items-center justify-center">
              {{ noLeidas > 9 ? '9+' : noLeidas }}
            </span>
          }
        </button>

        @if (abierto) {
          <div class="absolute right-0 mt-2 w-80 max-w-[90vw] bg-elevated border border-line rounded-xl shadow-xl z-50 overflow-hidden">
            <div class="flex items-center justify-between px-4 py-3 border-b border-line bg-muted/50">
              <h3 class="text-sm font-bold text-ink">Notificaciones</h3>
              @if (noLeidas > 0) {
                <button type="button" (click)="marcarTodas()"
                        class="text-xs text-primary-500 hover:underline">
                  Marcar todas leídas
                </button>
              }
            </div>
            <ul class="max-h-72 overflow-y-auto divide-y divide-line">
              @if (notificaciones.length === 0) {
                <li class="px-4 py-6 text-center text-sm text-ink-muted">Sin notificaciones</li>
              }
              @for (n of notificaciones; track n.id) {
                <li class="px-4 py-3 text-sm hover:bg-muted transition-colors notif-no-leida group relative"
                    [class.notif-leida]="n.leida"
                    [class.cursor-pointer]="tieneRuta(n)"
                    (click)="abrirNotificacion(n)">
                  <button type="button"
                          (click)="eliminar(n, $event)"
                          class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-ink-muted hover:text-red-600 p-1 rounded"
                          aria-label="Eliminar notificación"
                          title="Eliminar">
                    ✕
                  </button>
                  <p class="font-semibold text-ink pr-6">{{ n.titulo }}</p>
                  <p class="text-ink-muted mt-0.5">{{ n.mensaje }}</p>
                  <p class="text-[10px] text-ink-muted mt-1">{{ n.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                  @if (tieneRuta(n)) {
                    <p class="text-[10px] text-primary-500 mt-1">Toca para abrir →</p>
                  }
                </li>
              }
            </ul>
            <p class="px-4 py-2 text-[10px] text-ink-muted border-t border-line bg-muted/30">
              También recibirás un correo si tu cuenta tiene email registrado.
            </p>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .notif-no-leida:not(.notif-leida) {
      background: rgb(var(--color-accent-soft));
    }
  `],
})
export class NotificacionesPanelComponent implements OnInit, OnDestroy {
  auth = inject(AuthRoleService);
  private poll = inject(NotificacionPollService);
  private router = inject(Router);
  private sub?: Subscription;

  abierto = false;
  notificaciones: any[] = [];
  noLeidas = 0;
  activo = false;

  ngOnInit(): void {
    this.activo = this.tieneNotificaciones();
    if (!this.activo) return;
    this.poll.iniciar();
    this.sub = this.poll.cambios$.subscribe(({ notificaciones, noLeidas }) => {
      this.notificaciones = notificaciones;
      this.noLeidas = noLeidas;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.poll.detener();
  }

  private tieneNotificaciones(): boolean {
    return this.auth.canInscribirseTalleres()
      || this.auth.isProfesor()
      || this.auth.isCoordinacion()
      || this.auth.isSuperAdmin()
      || this.auth.isAdmin();
  }

  toggle(): void {
    this.abierto = !this.abierto;
    if (this.abierto) this.poll.refrescar();
  }

  tieneRuta(n: any): boolean {
    return !!rutaDesdeNotificacion(n);
  }

  abrirNotificacion(n: any): void {
    if (!n.leida) this.poll.marcarLeida(n.id);
    const ruta = rutaDesdeNotificacion(n);
    if (!ruta) return;
    this.abierto = false;
    this.router.navigateByUrl(ruta);
  }

  eliminar(n: any, event: MouseEvent): void {
    event.stopPropagation();
    if (!confirm('¿Eliminar esta notificación?')) return;
    this.poll.eliminar(n.id);
  }

  marcarTodas(): void {
    this.poll.marcarTodasLeidas();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('app-notificaciones-panel')) {
      this.abierto = false;
    }
  }
}
