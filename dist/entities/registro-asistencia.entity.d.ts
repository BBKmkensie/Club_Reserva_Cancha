import { SesionAsistencia } from './sesion-asistencia.entity';
import { Alumno } from './alumno.entity';
export type EstadoAsistencia = 'PRESENTE' | 'AUSENTE' | 'TARDE';
export declare class RegistroAsistencia {
    id: number;
    sesionId: number;
    sesion: SesionAsistencia;
    alumnoId: number;
    alumno: Alumno;
    estado: EstadoAsistencia;
    observacion: string | null;
}
