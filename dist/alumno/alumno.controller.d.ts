import { AlumnoService } from './alumno.service';
import { CreateAlumnoDto } from '../dto/create-alumno.dto';
export declare class AlumnoController {
    private readonly alumnoService;
    constructor(alumnoService: AlumnoService);
    create(createAlumnoDto: CreateAlumnoDto): Promise<import("../entities/alumno.entity").Alumno>;
    findAll(tallerId?: string): Promise<import("../entities/alumno.entity").Alumno[]>;
    findOne(id: number): Promise<import("../entities/alumno.entity").Alumno>;
    update(id: number, updateAlumnoDto: Partial<CreateAlumnoDto>): Promise<import("../entities/alumno.entity").Alumno>;
    remove(id: number): Promise<void>;
}
