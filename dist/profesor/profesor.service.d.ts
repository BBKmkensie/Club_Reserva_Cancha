import { Repository } from 'typeorm';
import { Profesor } from '../entities/profesor.entity';
import { CreateProfesorDto } from '../dto/create-profesor.dto';
export declare class ProfesorService {
    private profesorRepository;
    constructor(profesorRepository: Repository<Profesor>);
    create(createProfesorDto: CreateProfesorDto): Promise<Profesor>;
    findAll(): Promise<Profesor[]>;
    findOne(id: number): Promise<Profesor>;
    findByTaller(tallerId: number): Promise<Profesor[]>;
    update(id: number, updateProfesorDto: Partial<CreateProfesorDto>): Promise<Profesor>;
    remove(id: number): Promise<void>;
    findByUsuario(usuario: string): Promise<Profesor | null>;
    private verifyPassword;
    private setPasswordToDefault;
    login(usuario: string, password: string): Promise<Omit<Profesor, 'passwordHash' | 'passwordSalt'>>;
}
