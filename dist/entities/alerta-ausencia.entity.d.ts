import { Alumno } from './alumno.entity';
import { Taller } from './taller.entity';
export type EstadoAlertaAusencia = 'PENDIENTE' | 'APODERADO_CONTACTADO' | 'RESUELTO';
export declare class AlertaAusencia {
    id: number;
    alumnoId: number;
    alumno: Alumno;
    tallerId: number;
    taller: Taller;
    cantidadAusencias: number;
    estado: EstadoAlertaAusencia;
    notas: string | null;
    createdAt: Date;
    contactadoAt: Date | null;
    resueltoAt: Date | null;
}
