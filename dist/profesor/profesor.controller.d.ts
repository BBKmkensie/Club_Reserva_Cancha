import { ProfesorService } from './profesor.service';
import { CreateProfesorDto } from '../dto/create-profesor.dto';
import { LoginProfesorDto } from '../dto/login-profesor.dto';
export declare class ProfesorController {
    private readonly profesorService;
    constructor(profesorService: ProfesorService);
    login(dto: LoginProfesorDto): Promise<Omit<import("../entities/profesor.entity").Profesor, "passwordHash" | "passwordSalt">>;
    create(createProfesorDto: CreateProfesorDto): Promise<import("../entities/profesor.entity").Profesor>;
    findAll(tallerId?: string): Promise<import("../entities/profesor.entity").Profesor[]>;
    findOne(id: number): Promise<import("../entities/profesor.entity").Profesor>;
    update(id: number, updateProfesorDto: Partial<CreateProfesorDto>): Promise<import("../entities/profesor.entity").Profesor>;
    remove(id: number): Promise<void>;
}
