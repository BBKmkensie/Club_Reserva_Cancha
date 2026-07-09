import { Repository } from 'typeorm';
import { Alumno } from '../entities/alumno.entity';
import { Profesor } from '../entities/profesor.entity';
export interface SeedApoderadosResult {
    actualizados: number;
    omitidos: number;
    rutPoolAgotado: boolean;
    detalle: Array<{
        alumnoId: number;
        nombre: string;
        apoderadoNombre: string;
        apoderadoRut: string;
        apoderadoEmail: string;
    }>;
}
export declare class ApoderadoSeedService {
    private alumnoRepo;
    private profesorRepo;
    constructor(alumnoRepo: Repository<Alumno>, profesorRepo: Repository<Profesor>);
    seedMissingApoderados(): Promise<SeedApoderadosResult>;
    actualizarNombresApoderados(): Promise<SeedApoderadosResult>;
    private nextNombre;
    migrarEmailsGmail(): Promise<SeedApoderadosResult>;
}
