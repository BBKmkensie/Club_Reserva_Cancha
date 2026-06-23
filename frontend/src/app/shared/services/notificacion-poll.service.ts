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

  readonly cambios$ = this.actualizaciones$.asObservable();

  iniciar(_intervaloMs = 15000): void {
    this.detener();
    const alumnoId = this.auth.currentUserId();
    if (!this.auth.canInscribirseTalleres() || !alumnoId) return;

    this.refrescar();
    this.conectarSse(alumnoId);
  }

  private conectarSse(alumnoId: number): void {
    const url = `${environment.apiUrl}/notificacion/sse/alumno/${alumnoId}`;
    this.eventSource = new EventSource(url);

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data?.type === 'ping') return;
      } catch {
        // notificación nueva u otro payload
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
        filter(() => this.auth.canInscribirseTalleres() && !!this.auth.currentUserId()),
      )
      .subscribe(() => this.refrescar());
  }

  detener(): void {
    this.eventSource?.close();
    this.eventSource = undefined;
    this.fallbackSub?.unsubscribe();
    this.fallbackSub = undefined;
  }

  refrescar(): void {
    const alumnoId = this.auth.currentUserId();
    if (!alumnoId || !this.auth.canInscribirseTalleres()) return;
    this.api.getNotificaciones(alumnoId).subscribe({
      next: (notificaciones) => {
        const list = notificaciones ?? [];
        this.actualizaciones$.next({
          notificaciones: list,
          noLeidas: list.filter((n) => !n.leida).length,
        });
      },
    });
  }

  ngOnDestroy(): void {
    this.detener();
  }
}
