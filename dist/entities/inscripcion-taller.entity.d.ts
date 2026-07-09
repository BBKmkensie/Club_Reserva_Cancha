import { Alumno } from './alumno.entity';
import { Taller } from './taller.entity';
export type EstadoInscripcionTaller = 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO';
export declare class InscripcionTaller {
    id: number;
    alumnoId: number;
    alumno: Alumno;
    tallerId: number;
    taller: Taller;
    estado: EstadoInscripcionTaller;
    altura: number | null;
    peso: number | null;
    porcentajeGrasa: number | null;
    sedentario: boolean | null;
    createdAt: Date;
}
