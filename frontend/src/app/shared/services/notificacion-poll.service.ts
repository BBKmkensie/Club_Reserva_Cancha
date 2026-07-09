/**
 * Actualización en tiempo real de notificaciones del usuario.
 * Usa Server-Sent Events (SSE) con respaldo por polling periódico.
 */
import { Injectable, inject, OnDestroy } from '@angular/core';
import { Subject, interval, Subscription, filter, startWith } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { AuthRoleService } from './auth-role.service';
import { environment } from '../../../environments/environment';

/** Payload emitido cuando cambia el listado o el conteo de notificaciones no leídas. */
export interface NotificacionActualizada {
  notificaciones: any[];
  noLeidas: number;
}

type Destinatario = 'alumno' | 'profesor' | 'admin';

/**
 * Servicio que mantiene sincronizadas las notificaciones del usuario logueado.
 * Emite cambios vía `cambios$` para que la UI (navbar, dashboard) se actualice.
 */
@Injectable({ providedIn: 'root' })
export class NotificacionPollService implements OnDestroy {
  private api = inject(ApiService);
  private auth = inject(AuthRoleService);
  private actualizaciones$ = new Subject<NotificacionActualizada>();
  private eventSource?: EventSource;
  private fallbackSub?: Subscription;
  private destinatario: Destinatario | null = null;
  private userId: number | null = null;

  readonly cambios$ = this.actualizaciones$.asObservable();

  /** Inicia la conexión SSE y la primera carga de notificaciones según el rol del usuario. */
  iniciar(): void {
    this.detener();
    const userId = this.auth.currentUserId();
    if (!this.auth.isLoggedIn() || !userId) return;

    this.destinatario = this.resolverDestinatario();
    this.userId = userId;
    if (!this.destinatario) return;

    this.refrescar();
    this.conectarSse();
  }

  private resolverDestinatario(): Destinatario | null {
    if (this.auth.canInscribirseTalleres()) return 'alumno';
    if (this.auth.isProfesor()) return 'profesor';
    if (this.auth.isCoordinacion() || this.auth.isSuperAdmin() || this.auth.isAdmin()) return 'admin';
    return null;
  }

  private conectarSse(): void {
    if (!this.destinatario || !this.userId) return;
    const url = `${environment.apiUrl}/notificacion/sse/${this.destinatario}/${this.userId}`;
    this.eventSource = new EventSource(url);

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data?.type === 'ping') return;
      } catch {
        // nueva notificación
      }
      this.refrescar();
    };

    this.eventSource.onerror = () => {
      this.eventSource?.close();
      this.eventSource = undefined;
      this.iniciarFallback(30000);
    };
  }

  private iniciarFallback(intervaloMs: number): void {
    this.fallbackSub?.unsubscribe();
    this.fallbackSub = interval(intervaloMs)
      .pipe(
        startWith(0),
        filter(() => !!this.auth.isLoggedIn() && !!this.destinatario && !!this.userId),
      )
      .subscribe(() => this.refrescar());
  }

  /** Detiene SSE, polling y limpia el contexto del destinatario. */
  detener(): void {
    this.eventSource?.close();
    this.eventSource = undefined;
    this.fallbackSub?.unsubscribe();
    this.fallbackSub = undefined;
    this.destinatario = null;
    this.userId = null;
  }

  /** Consulta la API y emite el listado actualizado con el conteo de no leídas. */
  refrescar(): void {
    if (!this.destinatario || !this.userId) {
      this.destinatario = this.resolverDestinatario();
      this.userId = this.auth.currentUserId();
    }
    if (!this.destinatario || !this.userId) return;

    const obs =
      this.destinatario === 'alumno'
        ? this.api.getNotificaciones(this.userId)
        : this.destinatario === 'profesor'
          ? this.api.getNotificacionesProfesor(this.userId)
          : this.api.getNotificacionesAdmin(this.userId);

    obs.subscribe({
      next: (notificaciones) => {
        const list = notificaciones ?? [];
        this.actualizaciones$.next({
          notificaciones: list,
          noLeidas: list.filter((n) => !n.leida).length,
        });
      },
    });
  }

  /** Marca la notificación como leída según el destinatario (alumno, profesor o admin). */
  marcarLeida(id: number): void {
    if (!this.destinatario || !this.userId) return;
    const obs =
      this.destinatario === 'alumno'
        ? this.api.marcarNotificacionLeida(id, this.userId)
        : this.destinatario === 'profesor'
          ? this.api.marcarNotificacionLeidaProfesor(id, this.userId)
          : this.api.marcarNotificacionLeidaAdmin(id, this.userId);
    obs.subscribe({ next: () => this.refrescar() });
  }

  /** Marca todas las notificaciones como leídas según el destinatario actual. */
  marcarTodasLeidas(): void {
    if (!this.destinatario || !this.userId) return;
    const obs =
      this.destinatario === 'alumno'
        ? this.api.marcarTodasNotificacionesLeidas(this.userId)
        : this.destinatario === 'profesor'
          ? this.api.marcarTodasNotificacionesLeidasProfesor(this.userId)
          : this.api.marcarTodasNotificacionesLeidasAdmin(this.userId);
    obs.subscribe({ next: () => this.refrescar() });
  }

  /** Elimina una notificación y refresca el listado. */
  eliminar(id: number): void {
    if (!this.destinatario || !this.userId) return;
    this.api.eliminarNotificacion(id, this.userId, this.destinatario).subscribe({
      next: () => this.refrescar(),
    });
  }

  ngOnDestroy(): void {
    this.detener();
  }
}
