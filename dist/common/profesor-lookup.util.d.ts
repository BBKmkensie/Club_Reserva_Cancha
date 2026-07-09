import { Repository } from 'typeorm';
import { Profesor } from '../entities/profesor.entity';
export declare function buscarProfesorPorUsuario(repo: Repository<Profesor>, usuario: string): Promise<Profesor | null>;
