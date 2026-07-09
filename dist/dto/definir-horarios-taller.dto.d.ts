export type ModoHorarioTaller = 'POR_CURSO' | 'POR_SECCION';
export declare class HorarioTallerItemDto {
    curso?: string;
    seccion?: string;
    diaSemana: number;
    horaInicio: string;
    horaFin: string;
}
export declare class DefinirHorariosTallerDto {
    modo: ModoHorarioTaller;
    horarios: HorarioTallerItemDto[];
}
