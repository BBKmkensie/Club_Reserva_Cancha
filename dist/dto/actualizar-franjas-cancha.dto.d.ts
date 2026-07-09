export declare class FranjaCanchaItemDto {
    diaSemana: number;
    horaInicio: string;
    activa: boolean;
    duracionMinutos?: number;
}
export declare class ActualizarFranjasCanchaDto {
    espacio?: string;
    franjas: FranjaCanchaItemDto[];
}
