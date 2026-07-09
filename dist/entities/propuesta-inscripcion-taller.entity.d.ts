import { Alumno } from './alumno.entity';
import { Taller } from './taller.entity';
import { TallerHorario } from './taller-horario.entity';
export type EstadoPropuestaInscripcion = 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';
export declare class PropuestaInscripcionTaller {
    id: number;
    alumnoId: number;
    alumno: Alumno;
    tallerId: number | null;
    taller: Taller | null;
    actividadLibreNombre: string | null;
    actividadLibreDescripcion: string | null;
    estado: EstadoPropuestaInscripcion;
    motivoRechazo: string | null;
    tallerHorarioId: number | null;
    tallerHorario: TallerHorario | null;
    horarioPropuestoTexto: string | null;
    horarioSugeridoId: number | null;
    horarioSugerido: TallerHorario | null;
    horarioSugeridoTexto: string | null;
    mensajeApoderado: string | null;
    mensajeDirectiva: string | null;
    createdAt: Date;
    respondedAt: Date | null;
}
