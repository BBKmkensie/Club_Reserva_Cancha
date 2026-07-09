export interface BloqueHorarioOficial {
    diaSemana: number;
    horaInicio: string;
    horaFin: string;
    sala?: string;
}
export interface TallerHorariosOficialesSeed {
    tipo: string;
    alias?: string[];
    bloques: BloqueHorarioOficial[];
}
export declare const HORARIOS_OFICIALES_TALLERES: TallerHorariosOficialesSeed[];
export declare const MENSAJE_SIN_HORARIO = "El horario de este taller a\u00FAn no se ha agregado.";
