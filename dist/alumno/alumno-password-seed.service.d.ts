import { Repository } from 'typeorm';
import { Alumno } from '../entities/alumno.entity';
export interface SeedAlumnoPasswordsResult {
    actualizados: number;
    omitidos: number;
    detalle: Array<{
        alumnoId: number;
        nombre: string;
        rut: string;
    }>;
}
export declare class AlumnoPasswordSeedService {
    private alumnoRepo;
    constructor(alumnoRepo: Repository<Alumno>);
    seedMissingPasswords(): Promise<SeedAlumnoPasswordsResult>;
}
