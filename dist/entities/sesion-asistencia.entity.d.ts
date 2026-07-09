import { Taller } from './taller.entity';
import { Profesor } from './profesor.entity';
import { RegistroAsistencia } from './registro-asistencia.entity';
export type EstadoSesion = 'ABIERTA' | 'CERRADA';
export declare class SesionAsistencia {
    id: number;
    tallerId: number;
    taller: Taller;
    profesorId: number;
    profesor: Profesor;
    fecha: string;
    estado: EstadoSesion;
    observaciones: string | null;
    listaGuardada: boolean;
    openedAt: Date;
    closedAt: Date | null;
    registros: RegistroAsistencia[];
}
