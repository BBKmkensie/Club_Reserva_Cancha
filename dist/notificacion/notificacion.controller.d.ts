import { Observable } from 'rxjs';
import { MessageEvent } from '@nestjs/common';
import { NotificacionService } from './notificacion.service';
import { NotificacionStreamService } from './notificacion-stream.service';
export declare class NotificacionController {
    private readonly notificacionService;
    private readonly streamService;
    constructor(notificacionService: NotificacionService, streamService: NotificacionStreamService);
    sseAlumno(alumnoId: number): Observable<MessageEvent>;
    sseProfesor(profesorId: number): Observable<MessageEvent>;
    findByAlumno(alumnoId: number): Promise<import("../entities/notificacion.entity").Notificacion[]>;
    contarNoLeidas(alumnoId: number): Promise<number>;
    marcarLeida(id: number, alumnoId: number): Promise<import("../entities/notificacion.entity").Notificacion>;
    marcarTodasLeidas(alumnoId: number): Promise<void>;
    findByProfesor(profesorId: number): Promise<import("../entities/notificacion.entity").Notificacion[]>;
    contarNoLeidasProfesor(profesorId: number): Promise<number>;
    marcarLeidaProfesor(id: number, profesorId: number): Promise<import("../entities/notificacion.entity").Notificacion>;
    marcarTodasLeidasProfesor(profesorId: number): Promise<void>;
    sseAdmin(adminId: number): Observable<MessageEvent>;
    findByAdmin(adminId: number): Promise<import("../entities/notificacion.entity").Notificacion[]>;
    contarNoLeidasAdmin(adminId: number): Promise<number>;
    marcarLeidaAdmin(id: number, adminId: number): Promise<import("../entities/notificacion.entity").Notificacion>;
    marcarTodasLeidasAdmin(adminId: number): Promise<void>;
    eliminarAlumno(id: number, alumnoId: number): Promise<void>;
    eliminarProfesor(id: number, profesorId: number): Promise<void>;
    eliminarAdmin(id: number, adminId: number): Promise<void>;
}
