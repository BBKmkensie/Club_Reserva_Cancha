import { Repository } from 'typeorm';
import { Alumno } from '../entities/alumno.entity';
import { Admin } from '../entities/admin.entity';
import { InscripcionTaller } from '../entities/inscripcion-taller.entity';
import { Profesor } from '../entities/profesor.entity';
export interface ReportePersonasInscripciones {
    alumnosSinTaller: Array<{
        id: number;
        nombre: string;
        rut: string;
        edad: number | null;
    }>;
    alumnosInscritos: Array<{
        id: number;
        nombre: string;
        rut: string;
        taller: string;
        tallerId: number;
        estado: string;
    }>;
    apoderados: Array<{
        nombre: string;
        rut: string | null;
        email: string | null;
        telefono: string | null;
        alumno: string;
        alumnoRut: string;
    }>;
    directiva: Array<{
        id: number;
        nombre: string;
        rut: string;
        email: string;
    }>;
    admins: Array<{
        id: number;
        nombre: string;
        rut: string;
        email: string;
        rol: string;
    }>;
    profesores: Array<{
        id: number;
        nombre: string;
        rut: string;
        email: string;
        telefono: string | null;
        taller: string;
        tallerId: number;
    }>;
}
export declare class ReportesService {
    private alumnoRepo;
    private adminRepo;
    private inscripcionRepo;
    private profesorRepo;
    constructor(alumnoRepo: Repository<Alumno>, adminRepo: Repository<Admin>, inscripcionRepo: Repository<InscripcionTaller>, profesorRepo: Repository<Profesor>);
    getPersonasInscripciones(): Promise<ReportePersonasInscripciones>;
}
