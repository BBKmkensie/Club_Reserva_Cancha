import { Taller } from './taller.entity';
export declare class TallerHorario {
    id: number;
    tallerId: number;
    taller: Taller;
    curso: string | null;
    seccion: string | null;
    diaSemana: number;
    horaInicio: string;
    horaFin: string;
}
