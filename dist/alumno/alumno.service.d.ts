import { Repository } from 'typeorm';
import { Alumno } from '../entities/alumno.entity';
import { CreateAlumnoDto } from '../dto/create-alumno.dto';
export declare class AlumnoService {
    private alumnoRepository;
    constructor(alumnoRepository: Repository<Alumno>);
    create(createAlumnoDto: CreateAlumnoDto): Promise<Alumno>;
    findAll(): Promise<Alumno[]>;
    findOne(id: number): Promise<Alumno>;
    findByTaller(tallerId: number): Promise<Alumno[]>;
    update(id: number, updateAlumnoDto: Partial<CreateAlumnoDto>): Promise<Alumno>;
    remove(id: number): Promise<void>;
    private validarEdad;
}
