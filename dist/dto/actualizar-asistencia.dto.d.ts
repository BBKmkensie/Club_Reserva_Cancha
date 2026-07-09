export declare class RegistroAsistenciaItemDto {
    alumnoId: number;
    estado: 'PRESENTE' | 'AUSENTE' | 'TARDE';
    observacion?: string;
}
export declare class ActualizarAsistenciaDto {
    registros: RegistroAsistenciaItemDto[];
}
