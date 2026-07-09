/**
 * Servicio de streaming SSE para notificaciones en tiempo real.
 * Mantiene canales por alumno, profesor y administrador con heartbeat periódico.
 */
import { Injectable } from '@nestjs/common';
import { MessageEvent } from '@nestjs/common';
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

  streamProfesor(profesorId: number): Observable<MessageEvent> {
    const subject = this.getOrCreate(this.profesorStreams, profesorId);
    return this.buildStream(subject, () => this.cleanup(this.profesorStreams, profesorId, subject));
  }

  streamAdmin(adminId: number): Observable<MessageEvent> {
    const subject = this.getOrCreate(this.adminStreams, adminId);
    return this.buildStream(subject, () => this.cleanup(this.adminStreams, adminId, subject));
  }

  /** Emite una notificación nueva a los clientes SSE suscritos del alumno. */
  emitAlumno(alumnoId: number, notificacion: Notificacion): void {
    this.alumnoStreams.get(alumnoId)?.next(notificacion);
  }

  emitProfesor(profesorId: number, notificacion: Notificacion): void {
    this.profesorStreams.get(profesorId)?.next(notificacion);
  }

  emitAdmin(adminId: number, notificacion: Notificacion): void {
    this.adminStreams.get(adminId)?.next(notificacion);
  }

  private getOrCreate<T>(map: Map<number, Subject<T>>, id: number): Subject<T> {
    let subject = map.get(id);
    if (!subject) {
      subject = new Subject<T>();
      map.set(id, subject);
    }
    return subject;
  }

  /** Construye el observable SSE combinando eventos de datos y ping de keep-alive. */
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
