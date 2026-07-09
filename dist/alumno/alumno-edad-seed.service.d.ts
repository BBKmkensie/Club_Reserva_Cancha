import { Repository } from 'typeorm';
import { Alumno } from '../entities/alumno.entity';
import { EDAD_ALUMNO_MAX, EDAD_ALUMNO_MIN } from '../common/alumno-edad.constants';
export interface SeedAlumnoEdadesResult {
    actualizados: number;
    omitidos: number;
    detalle: Array<{
        alumnoId: number;
        nombre: string;
        edadAnterior: number | null;
        edadNueva: number;
    }>;
}
export declare class AlumnoEdadSeedService {
    private alumnoRepo;
    constructor(alumnoRepo: Repository<Alumno>);
    seedMissingEdades(): Promise<SeedAlumnoEdadesResult>;
}
export { EDAD_ALUMNO_MIN, EDAD_ALUMNO_MAX };
