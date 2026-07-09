import { Repository } from 'typeorm';
import { InscripcionSalida } from '../entities/inscripcion-salida.entity';
import { InscripcionTaller } from '../entities/inscripcion-taller.entity';
import { Alumno } from '../entities/alumno.entity';
import { Salida } from '../entities/salida.entity';
import { CreateInscripcionSalidaDto } from '../dto/create-inscripcion-salida.dto';
export declare class InscripcionSalidaService {
    private inscripcionRepository;
    private inscripcionTallerRepository;
    private alumnoRepository;
    private salidaRepository;
    constructor(inscripcionRepository: Repository<InscripcionSalida>, inscripcionTallerRepository: Repository<InscripcionTaller>, alumnoRepository: Repository<Alumno>, salidaRepository: Repository<Salida>);
    private talleresInscritosAlumno;
    inscribir(dto: CreateInscripcionSalidaDto): Promise<InscripcionSalida>;
    findBySalida(salidaId: number): Promise<InscripcionSalida[]>;
    findByAlumno(alumnoId: number): Promise<InscripcionSalida[]>;
    remove(alumnoId: number, salidaId: number): Promise<void>;
}
