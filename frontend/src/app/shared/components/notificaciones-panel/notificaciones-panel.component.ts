/**
 * =============================================================================
 * app/shared/components/notificaciones-panel/notificaciones-panel.component.ts — Panel de notificaciones
 * =============================================================================
 * Campana con contador de avisos no leídos y lista desplegable. Consulta el
 * backend en tiempo real vía NotificacionPollService. Se integra en el navbar
 * para usuarios con notificaciones habilitadas (alumno, profesor, coordinación,
 * admin).
 *
 * Métodos clave: ngOnInit(), ngOnDestroy(), toggle(), abrirNotificacion(),
 * marcarTodas(), tieneRuta(), eliminar().
 * =============================================================================
 */
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
      <div class="notif-host relative shrink-0">
        <button type="button"
                (click)="toggle(); $event.stopPropagation()"
                class="relative p-1.5 sm:p-2 rounded-lg border border-line-strong hover:bg-muted transition-colors"
                [attr.aria-expanded]="abierto"
                aria-label="Notificaciones">
          <svg class="w-4 h-4 sm:w-5 sm:h-5 text-ink-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
          @if (noLeidas > 0) {
            <span class="absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-palette-magenta text-white text-[10px] font-bold flex items-center justify-center">
              {{ noLeidas > 9 ? '9+' : noLeidas }}
            </span>
          }
        </button>
      </div>

      @if (abierto) {
        <!-- Portal fijo al viewport: en móvil ocupa el ancho de la pantalla, no el de la campana -->
        <div class="notif-portal" (click)="cerrar()">
          <div class="notif-backdrop" aria-hidden="true"></div>
          <div class="notif-panel" role="dialog" aria-label="Notificaciones" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between gap-2 px-3 sm:px-4 py-3 border-b border-line bg-muted/50 shrink-0">
              <h3 class="text-sm font-bold text-ink truncate">Notificaciones</h3>
              <div class="flex items-center gap-2 sm:gap-3 shrink-0">
                @if (noLeidas > 0) {
                  <button type="button" (click)="marcarTodas()"
                          class="text-xs text-primary-500 hover:underline whitespace-nowrap">
                    Marcar todas leídas
                  </button>
                }
                <button type="button" (click)="cerrar()"
                        class="notif-close-btn text-ink-muted hover:text-ink p-1 rounded"
                        aria-label="Cerrar notificaciones">
                  ✕
                </button>
              </div>
            </div>
            <ul class="overflow-y-auto overscroll-contain divide-y divide-line flex-1 min-h-0">
              @if (notificaciones.length === 0) {
                <li class="px-4 py-6 text-center text-sm text-ink-muted">Sin notificaciones</li>
              }
              @for (n of notificaciones; track n.id) {
                <li class="px-3 sm:px-4 py-3 text-sm hover:bg-muted transition-colors notif-no-leida group relative"
                    [class.notif-leida]="n.leida"
                    [class.cursor-pointer]="tieneRuta(n)"
                    (click)="abrirNotificacion(n)">
                  <button type="button"
                          (click)="eliminar(n, $event)"
                          class="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-ink-muted hover:text-red-600 p-1.5 rounded touch-manipulation"
                          aria-label="Eliminar notificación"
                          title="Eliminar">
                    ✕
                  </button>
                  <p class="font-semibold text-ink pr-8 break-words">{{ n.titulo }}</p>
                  <p class="text-ink-muted mt-0.5 break-words leading-snug">{{ n.mensaje }}</p>
                  <p class="text-[10px] text-ink-muted mt-1">{{ n.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                  @if (tieneRuta(n)) {
                    <p class="text-[10px] text-primary-500 mt-1">Toca para abrir →</p>
                  }
                </li>
              }
            </ul>
            <p class="px-3 sm:px-4 py-2 text-[10px] text-ink-muted border-t border-line bg-muted/30 shrink-0 leading-snug break-words">
              También recibirás un correo si tu cuenta tiene email registrado.
            </p>
          </div>
        </div>
      }
    }
  `,
  styles: [`
    :host {
      display: inline-block;
      position: relative;
      vertical-align: middle;
    }

    .notif-no-leida:not(.notif-leida) {
      background: rgb(var(--color-accent-soft));
    }

    /* Contenedor a pantalla completa: el panel no hereda el ancho de la campana */
    .notif-portal {
      position: fixed;
      inset: 0;
      z-index: 200;
      pointer-events: auto;
    }

    .notif-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
    }

    .notif-panel {
      position: absolute;
      left: 0.75rem;
      right: 0.75rem;
      top: calc(3.5rem + env(safe-area-inset-top, 0px));
      width: auto;
      max-height: min(75vh, calc(100dvh - 4.5rem));
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border-radius: 0.75rem;
      border: 1px solid rgb(var(--color-border));
      background: rgb(var(--color-elevated));
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    }

    .notif-close-btn {
      display: inline-flex;
    }

    @media (min-width: 640px) {
      .notif-portal {
        position: absolute;
        inset: auto;
        top: 100%;
        right: 0;
        left: auto;
        z-index: 70;
        margin-top: 0.5rem;
      }

      .notif-backdrop {
        display: none;
      }

      .notif-panel {
        position: relative;
        left: auto;
        right: auto;
        top: auto;
        width: 20rem;
        max-width: min(20rem, calc(100vw - 1rem));
        max-height: 24rem;
      }

      .notif-close-btn {
        display: none;
      }
    }
  `],
})
export class NotificacionesPanelComponent implements OnInit, OnDestroy {
  /** Quién está logueado y si su rol recibe notificaciones. */
  auth = inject(AuthRoleService);
  /** Polling periódico + marcar leídas / eliminar. */
  private poll = inject(NotificacionPollService);
  /** Navega a la ruta asociada al tocar una notificación. */
  private router = inject(Router);
  /** Suscripción a poll.cambios$; se cancela en ngOnDestroy. */
  private sub?: Subscription;

  /** true = panel desplegable visible. */
  abierto = false;
  /** Lista actual de notificaciones (viene del poll). */
  notificaciones: any[] = [];
  /** Contador del badge rojo (máx. «9+» en la plantilla). */
  noLeidas = 0;
  /** false = rol sin notificaciones → no se renderiza la campana. */
  activo = false;

  /**
   * Verifica si el rol actual tiene notificaciones habilitadas e inicia el
   * polling periódico contra el backend para mantener la lista actualizada.
   */
  ngOnInit(): void {
    this.activo = this.tieneNotificaciones();
    if (!this.activo) return;
    this.poll.iniciar();
    this.sub = this.poll.cambios$.subscribe(({ notificaciones, noLeidas }) => {
      this.notificaciones = notificaciones;
      this.noLeidas = noLeidas;
    });
  }

  /**
   * Detiene el polling y libera la suscripción al destruir el componente.
   */
  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.poll.detener();
    this.bloquearScroll(false);
  }

  /** Roles que ven la campana: alumno, profesor, coordinación, admin. */
  private tieneNotificaciones(): boolean {
    const tipo = this.auth.currentUserTipo();
    return tipo === 'alumno' || tipo === 'profesor' || tipo === 'admin' || tipo === 'directiva';
  }

  /**
   * Abre o cierra el panel desplegable. Al abrir, fuerza un refresco inmediato
   * de la lista de notificaciones.
   */
  toggle(): void {
    this.abierto = !this.abierto;
    this.bloquearScroll(this.abierto);
    if (this.abierto) this.poll.refrescar();
  }

  cerrar(): void {
    this.abierto = false;
    this.bloquearScroll(false);
  }

  /** Evita scroll del fondo en móvil mientras el panel está abierto. */
  private bloquearScroll(bloquear: boolean): void {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = bloquear ? 'hidden' : '';
  }

  /**
   * Indica si la notificación tiene una ruta de destino asociada en la app
   * (permite mostrar el indicador «Toca para abrir»).
   */
  tieneRuta(n: any): boolean {
    return !!rutaDesdeNotificacion(n);
  }

  /**
   * Marca la notificación como leída y navega a la ruta asociada, si existe.
   * Cierra el panel al navegar.
   */
  abrirNotificacion(n: any): void {
    if (!n.leida) this.poll.marcarLeida(n.id);
    const ruta = rutaDesdeNotificacion(n);
    if (!ruta) return;
    this.cerrar();
    this.router.navigateByUrl(ruta);
  }

  /**
   * Elimina una notificación tras confirmación del usuario.
   * Detiene la propagación del clic para no disparar abrirNotificacion().
   */
  eliminar(n: any, event: MouseEvent): void {
    event.stopPropagation();
    if (!confirm('¿Eliminar esta notificación?')) return;
    this.poll.eliminar(n.id);
  }

  /**
   * Marca todas las notificaciones pendientes como leídas de una sola vez.
   */
  marcarTodas(): void {
    this.poll.marcarTodasLeidas();
  }

  /** Cierra el panel si el usuario hace clic fuera del componente (desktop). */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.abierto) return;
    const target = event.target as HTMLElement;
    if (!target.closest('app-notificaciones-panel')) {
      this.cerrar();
    }
  }
}
