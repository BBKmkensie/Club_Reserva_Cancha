import { Repository } from 'typeorm';
import { FichaAlumnoTaller } from '../entities/ficha-alumno-taller.entity';
import { Alumno } from '../entities/alumno.entity';
import { InscripcionTaller } from '../entities/inscripcion-taller.entity';
import { Profesor } from '../entities/profesor.entity';
import { ActualizarFichaAlumnoDto } from '../dto/ficha-alumno.dto';
export interface FichaAlumnoListItem {
    alumnoId: number;
    nombre: string;
    rut: string;
    tallerId: number;
    inscrito: boolean;
    estadoInscripcion?: string;
    altura: number | null;
    peso: number | null;
    porcentajeGrasa: number | null;
    sedentario: boolean | null;
}
export declare class FichaAlumnoService {
    private fichaRepo;
    private alumnoRepo;
    private inscripcionRepo;
    private profesorRepo;
    constructor(fichaRepo: Repository<FichaAlumnoTaller>, alumnoRepo: Repository<Alumno>, inscripcionRepo: Repository<InscripcionTaller>, profesorRepo: Repository<Profesor>);
    listarPorTaller(tallerId: number, opts: {
        soloInscritos?: boolean;
        esCoordinacion?: boolean;
        profesorId?: number;
    }): Promise<FichaAlumnoListItem[]>;
    private listarTodosAlumnosConFicha;
    private listarInscritosAceptados;
    private toItem;
    obtener(alumnoId: number, tallerId: number): Promise<FichaAlumnoListItem>;
    guardar(alumnoId: number, tallerId: number, dto: ActualizarFichaAlumnoDto): Promise<FichaAlumnoTaller>;
}
