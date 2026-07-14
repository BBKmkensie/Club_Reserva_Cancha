/**
 * =============================================================================
 * notificacion/notificacion-stream.service.ts — SSE EN TIEMPO REAL
 * =============================================================================
 * Server-Sent Events: el navegador abre una conexión HTTP larga y el servidor
 * empuja eventos cuando hay notificaciones nuevas.
 *
 * Implementación:
 *   - Un Subject RxJS por usuario (Map<id, Subject>)
 *   - streamX() → Observable<MessageEvent> (lo consume @Sse del controller)
 *   - emitX() → NotificacionService lo llama tras guardar en BD
 *   - Heartbeat cada 30s (type:'ping') para que proxies no cierren la conexión
 * =============================================================================
 */
import { Injectable } from '@nestjs/common';
// MessageEvent = forma del evento SSE que Nest envía al cliente
import { MessageEvent } from '@nestjs/common';
// Subject = emisor RxJS; merge = combina notificaciones + heartbeat; interval = ping 30s
import { Observable, Subject, merge, interval, map, finalize } from 'rxjs';
import { Notificacion } from '../entities/notificacion.entity';

/** Gestiona suscriptores RxJS y emisión de eventos SSE por usuario. */
@Injectable()
export class NotificacionStreamService {
  private alumnoStreams = new Map<number, Subject<Notificacion>>();
  private profesorStreams = new Map<number, Subject<Notificacion>>();
  private adminStreams = new Map<number, Subject<Notificacion>>();

  /** Abre un stream SSE para recibir notificaciones de un alumno. */
  streamAlumno(alumnoId: number): Observable<MessageEvent> {
    const subject = this.getOrCreate(this.alumnoStreams, alumnoId);
    return this.buildStream(subject, () => this.cleanup(this.alumnoStreams, alumnoId, subject));
  }

  /** Abre stream SSE para un profesor (EventSource en el frontend). */
  streamProfesor(profesorId: number): Observable<MessageEvent> {
    const subject = this.getOrCreate(this.profesorStreams, profesorId);
    return this.buildStream(subject, () => this.cleanup(this.profesorStreams, profesorId, subject));
  }

  /** Abre stream SSE para un administrador. */
  streamAdmin(adminId: number): Observable<MessageEvent> {
    const subject = this.getOrCreate(this.adminStreams, adminId);
    return this.buildStream(subject, () => this.cleanup(this.adminStreams, adminId, subject));
  }

  /** Emite una notificación nueva a los clientes SSE suscritos del alumno. */
  emitAlumno(alumnoId: number, notificacion: Notificacion): void {
    this.alumnoStreams.get(alumnoId)?.next(notificacion);
  }

  /** Empuja una notificación nueva a los clientes SSE del profesor. */
  emitProfesor(profesorId: number, notificacion: Notificacion): void {
    this.profesorStreams.get(profesorId)?.next(notificacion);
  }

  /** Empuja una notificación nueva a los clientes SSE del admin. */
  emitAdmin(adminId: number, notificacion: Notificacion): void {
    this.adminStreams.get(adminId)?.next(notificacion);
  }

  /** Reutiliza el Subject existente o crea uno nuevo para ese id. */
  private getOrCreate<T>(map: Map<number, Subject<T>>, id: number): Subject<T> {
    let subject = map.get(id);
    if (!subject) {
      subject = new Subject<T>();
      map.set(id, subject);
    }
    return subject;
  }

  /**
   * Combina:
   *   - eventos de datos (notificaciones)
   *   - heartbeat cada 30s (keep-alive)
   * finalize() limpia el Subject si ya no hay observadores.
   */
  private buildStream<T>(
    subject: Subject<T>,
    onCleanup: () => void,
  ): Observable<MessageEvent> {
    const events = subject.asObservable().pipe(
      map((payload) => ({ data: payload } as MessageEvent)),
      finalize(onCleanup),
    );
    const heartbeat = interval(30000).pipe(
      map(() => ({ data: { type: 'ping' } } as MessageEvent)),
    );
    return merge(events, heartbeat);
  }

  /** Si nadie escucha, borra el Subject del Map y lo completa. */
  private cleanup<T>(
    map: Map<number, Subject<T>>,
    id: number,
    subject: Subject<T>,
  ): void {
    if (!subject.observed) {
      map.delete(id);
      subject.complete();
    }
  }
}
