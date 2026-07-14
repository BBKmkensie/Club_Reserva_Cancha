/**
 * =============================================================================
 * app/shared/services/notificacion-poll.service.ts — Notificaciones en tiempo real
 * =============================================================================
 * Mantiene sincronizado el listado de notificaciones del usuario logueado.
 *
 * Estrategia dual:
 *   1. SSE (EventSource) → /notificacion/sse/{destinatario}/{userId}
 *   2. Fallback: polling cada 30 s si SSE falla
 *
 * Emite cambios vía cambios$ (navbar, campanita, dashboard).
 * Destinatarios: alumno | profesor | admin (según AuthRoleService).
 * =============================================================================
 */

// Injectable + OnDestroy = servicio con limpieza al destruirse.
// inject() = DI funcional.
import { Injectable, inject, OnDestroy } from '@angular/core';

// Subject = bus de eventos; interval = timer RxJS; Subscription = handle del poll.
// filter / startWith = operadores del pipe de fallback.
import { Subject, interval, Subscription, filter, startWith } from 'rxjs';

// Cliente HTTP centralizado (getNotificaciones, marcarLeida…).
import { ApiService } from '../../services/api.service';

// Sesión: userId, rol, isLoggedIn.
import { AuthRoleService } from './auth-role.service';

// apiUrl para armar la URL del EventSource (SSE no usa HttpClient).
import { environment } from '../../../environments/environment';

/** Payload que se emite cuando cambia el listado o el conteo de no leídas. */
export interface NotificacionActualizada {
  // Array crudo de notificaciones del backend.
  notificaciones: any[];
  // Cuántas tienen leida === false (badge de la campanita).
  noLeidas: number;
}

/** Quién recibe las notificaciones (define qué endpoints llamar). */
type Destinatario = 'alumno' | 'profesor' | 'admin';

@Injectable({ providedIn: 'root' })
export class NotificacionPollService implements OnDestroy {
  // Dependencias inyectadas.
  private api = inject(ApiService);
  private auth = inject(AuthRoleService);

  // Subject interno: quien se suscribe a cambios$ recibe actualizaciones.
  private actualizaciones$ = new Subject<NotificacionActualizada>();

  // Conexión SSE viva (undefined si está cerrada o en fallback).
  private eventSource?: EventSource;

  // Suscripción al interval de polling (fallback).
  private fallbackSub?: Subscription;

  // Contexto actual: a quién le pedimos notificaciones.
  private destinatario: Destinatario | null = null;
  private userId: number | null = null;

  /** Observable público: navbar / UI se suscriben aquí. */
  readonly cambios$ = this.actualizaciones$.asObservable();

  /**
   * iniciar — arranca el flujo de notificaciones.
   * 1) Detiene cualquier conexión previa
   * 2) Resuelve destinatario + userId
   * 3) Carga inicial (refrescar) + abre SSE
   */
  iniciar(): void {
    // Limpia SSE / poll anteriores para no duplicar.
    this.detener();

    const userId = this.auth.currentUserId();
    // Sin sesión o sin ID → no hay nada que escuchar.
    if (!this.auth.isLoggedIn() || !userId) return;

    this.destinatario = this.resolverDestinatario();
    this.userId = userId;
    // Apoderado u otros sin destinatario → salir en silencio.
    if (!this.destinatario) return;

    // Primera carga inmediata + canal en vivo.
    this.refrescar();
    this.conectarSse();
  }

  /**
   * Según permisos/rol, decide si pedimos notificaciones de
   * alumno, profesor o admin.
   */
  private resolverDestinatario(): Destinatario | null {
    if (this.auth.canInscribirseTalleres()) return 'alumno';
    if (this.auth.isProfesor()) return 'profesor';
    if (this.auth.isCoordinacion() || this.auth.isSuperAdmin() || this.auth.isAdmin()) return 'admin';
    return null;
  }

  /**
   * Abre EventSource a GET /notificacion/sse/{destinatario}/{userId}.
   * Cada mensaje (salvo ping) dispara un refrescar().
   * Si la conexión falla → cierra SSE e inicia polling cada 30 s.
   */
  private conectarSse(): void {
    if (!this.destinatario || !this.userId) return;

    // URL absoluta al endpoint SSE del NestJS.
    const url = `${environment.apiUrl}/notificacion/sse/${this.destinatario}/${this.userId}`;
    this.eventSource = new EventSource(url);

    // onmessage = cada evento push del servidor.
    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Los pings de keep-alive no deben disparar GET a la API.
        if (data?.type === 'ping') return;
      } catch {
        // Si el payload no es JSON, igual tratamos como "hay novedad".
      }
      this.refrescar();
    };

    // onerror = red caída, CORS, servidor reiniciado…
    this.eventSource.onerror = () => {
      this.eventSource?.close();
      this.eventSource = undefined;
      // Plan B: consultar la API cada 30 000 ms.
      this.iniciarFallback(30000);
    };
  }

  /**
   * Polling periódico si SSE no está disponible.
   * startWith(0) = dispara ya el primer tick; filter = solo si sigue logueado.
   */
  private iniciarFallback(intervaloMs: number): void {
    this.fallbackSub?.unsubscribe();
    this.fallbackSub = interval(intervaloMs)
      .pipe(
        startWith(0),
        filter(() => !!this.auth.isLoggedIn() && !!this.destinatario && !!this.userId),
      )
      .subscribe(() => this.refrescar());
  }

  /** Cierra SSE, cancela el poll y limpia destinatario/userId. */
  detener(): void {
    this.eventSource?.close();
    this.eventSource = undefined;
    this.fallbackSub?.unsubscribe();
    this.fallbackSub = undefined;
    this.destinatario = null;
    this.userId = null;
  }

  /**
   * Consulta la API según destinatario y emite { notificaciones, noLeidas }.
   * Endpoints:
   *   alumno  → GET /notificacion/por-alumno/:id
   *   profesor → GET /notificacion/por-profesor/:id
   *   admin   → GET /notificacion/por-admin/:id
   */
  refrescar(): void {
    // Si perdimos contexto, intentamos recalcularlo.
    if (!this.destinatario || !this.userId) {
      this.destinatario = this.resolverDestinatario();
      this.userId = this.auth.currentUserId();
    }
    if (!this.destinatario || !this.userId) return;

    // Elige el método de ApiService correcto según el rol.
    const obs =
      this.destinatario === 'alumno'
        ? this.api.getNotificaciones(this.userId)
        : this.destinatario === 'profesor'
          ? this.api.getNotificacionesProfesor(this.userId)
          : this.api.getNotificacionesAdmin(this.userId);

    obs.subscribe({
      next: (notificaciones) => {
        const list = notificaciones ?? [];
        // Emite a todos los suscriptores de cambios$.
        this.actualizaciones$.next({
          notificaciones: list,
          noLeidas: list.filter((n) => !n.leida).length,
        });
      },
    });
  }

  /**
   * Marca UNA notificación como leída y refresca el listado.
   * PATCH según destinatario (leer / leer-profesor / leer-admin).
   */
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

  /**
   * Marca TODAS como leídas (badge → 0) y refresca.
   */
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

  /**
   * Elimina una notificación (DELETE según rol) y refresca.
   */
  eliminar(id: number): void {
    if (!this.destinatario || !this.userId) return;
    this.api.eliminarNotificacion(id, this.userId, this.destinatario).subscribe({
      next: () => this.refrescar(),
    });
  }

  /** Al destruir el servicio (raro en root), cortamos conexiones. */
  ngOnDestroy(): void {
    this.detener();
  }
}
