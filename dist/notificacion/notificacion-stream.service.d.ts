import { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Notificacion } from '../entities/notificacion.entity';
export declare class NotificacionStreamService {
    private alumnoStreams;
    private profesorStreams;
    private adminStreams;
    streamAlumno(alumnoId: number): Observable<MessageEvent>;
    streamProfesor(profesorId: number): Observable<MessageEvent>;
    streamAdmin(adminId: number): Observable<MessageEvent>;
    emitAlumno(alumnoId: number, notificacion: Notificacion): void;
    emitProfesor(profesorId: number, notificacion: Notificacion): void;
    emitAdmin(adminId: number, notificacion: Notificacion): void;
    private getOrCreate;
    private buildStream;
    private cleanup;
}
