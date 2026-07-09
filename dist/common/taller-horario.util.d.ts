import { Taller } from '../entities/taller.entity';
import { TallerHorario } from '../entities/taller-horario.entity';
export declare function normalizarHora(hora: string): string;
export declare function textoHorarioBloque(h: {
    diaSemana: number;
    horaInicio: string;
    horaFin: string;
    curso?: string | null;
    seccion?: string | null;
}): string;
export declare function textoHorarioTaller(taller: Taller): string | null;
export declare function opcionesHorarioTaller(taller: Taller): {
    id: number | null;
    etiqueta: string;
}[];
export declare function textoHorarioPorId(horario: TallerHorario | null | undefined, fallback?: string | null): string | null;
