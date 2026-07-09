import { Taller } from './taller.entity';
import { Profesor } from './profesor.entity';
export type EstadoAsignacionDocente = 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';
export declare class AsignacionDocente {
    id: number;
    tallerId: number;
    taller: Taller;
    profesorId: number;
    profesor: Profesor;
    estado: EstadoAsignacionDocente;
    motivoRechazo: string | null;
    createdAt: Date;
    respondedAt: Date | null;
}
