/**
 * =============================================================================
 * app/shared/services/notificacion-poll.service.ts — Notificaciones en tiempo real
 * =============================================================================
 * Mantiene sincronizado el listado de notificaciones del usuario logueado.
 *
 * Estrategia dual:
 *   1. SSE (EventSource) → /notificacion/sse?access_token=...
 *   2. Fallback: polling cada 30 s si SSE falla
 *
 * El backend filtra por JWT (sub + tipo), así cada usuario solo ve las suyas.
 * =============================================================================
 */

import { Injectable, inject, OnDestroy } from '@angular/core';
import { Subject, interval, Subscription, filter, startWith } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { AuthRoleService } from './auth-role.service';
import { environment } from '../../../environments/environment';

export interface NotificacionActualizada {
  notificaciones: any[];
  noLeidas: number;
}

@Injectable({ providedIn: 'root' })
export class NotificacionPollService implements OnDestroy {
  private api = inject(ApiService);
  private auth = inject(AuthRoleService);

  private actualizaciones$ = new Subject<NotificacionActualizada>();
  private eventSource?: EventSource;
  private fallbackSub?: Subscription;
  private activo = false;

  readonly cambios$ = this.actualizaciones$.asObservable();

  iniciar(): void {
    this.detener();

    if (!this.auth.isLoggedIn() || !this.auth.getToken() || !this.tieneBandeja()) return;

    this.activo = true;
    this.refrescar();
    this.conectarSse();
  }

  /** Solo perfiles con bandeja propia (alumno, profesor, directiva/admin). */
  private tieneBandeja(): boolean {
    const tipo = this.auth.currentUserTipo();
    return tipo === 'alumno' || tipo === 'profesor' || tipo === 'admin' || tipo === 'directiva';
  }

  private conectarSse(): void {
    const token = this.auth.getToken();
    if (!token || !this.activo) return;

    const url = `${environment.apiUrl}/notificacion/sse?access_token=${encodeURIComponent(token)}`;
    this.eventSource = new EventSource(url);

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data?.type === 'ping') return;
      } catch {
        // payload no JSON → refrescar igual
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
        filter(() => this.activo && !!this.auth.isLoggedIn() && !!this.auth.getToken()),
      )
      .subscribe(() => this.refrescar());
  }

  detener(): void {
    this.activo = false;
    this.eventSource?.close();
    this.eventSource = undefined;
    this.fallbackSub?.unsubscribe();
    this.fallbackSub = undefined;
  }

  refrescar(): void {
    if (!this.activo && this.auth.isLoggedIn() && this.tieneBandeja()) {
      this.activo = true;
    }
    if (!this.activo || !this.auth.isLoggedIn() || !this.auth.getToken()) return;

    this.api.getNotificaciones().subscribe({
      next: (notificaciones) => {
        const list = notificaciones ?? [];
        this.actualizaciones$.next({
          notificaciones: list,
          noLeidas: list.filter((n) => !n.leida).length,
        });
      },
    });
  }

  marcarLeida(id: number): void {
    if (!this.activo) return;
    this.api.marcarNotificacionLeida(id).subscribe({ next: () => this.refrescar() });
  }

  marcarTodasLeidas(): void {
    if (!this.activo) return;
    this.api.marcarTodasNotificacionesLeidas().subscribe({ next: () => this.refrescar() });
  }

  eliminar(id: number): void {
    if (!this.activo) return;
    this.api.eliminarNotificacion(id).subscribe({ next: () => this.refrescar() });
  }

  ngOnDestroy(): void {
    this.detener();
  }
}
