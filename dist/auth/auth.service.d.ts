import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Admin } from '../entities/admin.entity';
import { Profesor } from '../entities/profesor.entity';
import { Alumno } from '../entities/alumno.entity';
import { LoginDto } from '../dto/login.dto';
import { JwtPayload, LoginResponse } from './auth.types';
export declare class AuthService {
    private adminRepo;
    private profesorRepo;
    private alumnoRepo;
    private jwtService;
    constructor(adminRepo: Repository<Admin>, profesorRepo: Repository<Profesor>, alumnoRepo: Repository<Alumno>, jwtService: JwtService);
    login(dto: LoginDto): Promise<LoginResponse>;
    private loginUnified;
    private loginAdmin;
    private loginProfesor;
    private loginAlumno;
    private loginApoderado;
    private ensurePassword;
    private findProfesorByUsuario;
    private buildResponse;
    validatePayload(payload: JwtPayload): JwtPayload;
}
