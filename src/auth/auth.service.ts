import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../entities/admin.entity';
import { Profesor } from '../entities/profesor.entity';
import { Alumno } from '../entities/alumno.entity';
import { LoginDto } from '../dto/login.dto';
import {
  hashPassword,
  verifyPassword,
  needsPasswordInit,
  defaultPassword,
} from '../common/password.util';
import { AuthUserResponse, JwtPayload, LoginResponse, UserTipo } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private adminRepo: Repository<Admin>,
    @InjectRepository(Profesor)
    private profesorRepo: Repository<Profesor>,
    @InjectRepository(Alumno)
    private alumnoRepo: Repository<Alumno>,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponse> {
    if (!dto.tipo) {
      return this.loginUnified(dto.usuario, dto.password);
    }

    switch (dto.tipo) {
      case 'admin':
        return this.loginAdmin(dto.usuario, dto.password, 'super_admin');
      case 'directiva':
        return this.loginAdmin(dto.usuario, dto.password, 'directiva');
      case 'profesor':
        return this.loginProfesor(dto.usuario, dto.password);
      case 'alumno':
        return this.loginAlumno(dto.usuario, dto.password);
      default:
        throw new UnauthorizedException('Tipo de usuario no válido');
    }
  }

  private async loginUnified(usuario: string, password: string): Promise<LoginResponse> {
    const email = usuario.trim().toLowerCase();
    if (email.includes('@')) {
      const admin = await this.adminRepo.findOne({ where: { email } });
      if (admin) {
        return this.loginAdmin(usuario, password);
      }
    }

    try {
      return await this.loginProfesor(usuario, password);
    } catch {
      // continuar con alumno
    }

    return this.loginAlumno(usuario, password);
  }

  private async loginAdmin(
    usuario: string,
    password: string,
    expectedRol?: 'super_admin' | 'directiva',
  ): Promise<LoginResponse> {
    const email = usuario.trim().toLowerCase();
    const admin = await this.adminRepo.findOne({ where: { email } });
    if (!admin) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    if (expectedRol === 'super_admin' && admin.rol !== 'super_admin') {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }
    if (expectedRol === 'directiva' && admin.rol !== 'directiva') {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    await this.ensurePassword(
      admin,
      password,
      (entity, hash, salt) => {
        entity.passwordHash = hash;
        entity.passwordSalt = salt;
      },
      () => this.adminRepo.save(admin),
    );

    const isSuper = admin.rol === 'super_admin';
    return this.buildResponse({
      sub: admin.id,
      role: isSuper ? 'super_admin' : 'admin',
      tipo: isSuper ? 'admin' : 'directiva',
      nombre: admin.nombre,
    });
  }

  private async loginProfesor(usuario: string, password: string): Promise<LoginResponse> {
    const profesor = await this.findProfesorByUsuario(usuario);
    if (!profesor) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    await this.ensurePassword(
      profesor,
      password,
      (entity, hash, salt) => {
        entity.passwordHash = hash;
        entity.passwordSalt = salt;
      },
      () => this.profesorRepo.save(profesor),
    );

    return this.buildResponse({
      sub: profesor.id,
      role: 'admin',
      tipo: 'profesor',
      tallerId: profesor.tallerId,
      nombre: profesor.nombre,
    });
  }

  private async loginAlumno(usuario: string, password: string): Promise<LoginResponse> {
    const rut = usuario.trim();
    const alumno = await this.alumnoRepo.findOne({ where: { rut } });
    if (!alumno) {
      throw new UnauthorizedException('RUT o contraseña incorrectos');
    }

    await this.ensurePassword(
      alumno,
      password,
      (entity, hash, salt) => {
        entity.passwordHash = hash;
        entity.passwordSalt = salt;
      },
      () => this.alumnoRepo.save(alumno),
    );

    return this.buildResponse({
      sub: alumno.id,
      role: 'usuario',
      tipo: 'alumno',
      tallerId: alumno.tallerId ?? undefined,
      nombre: alumno.nombre,
    });
  }

  private async ensurePassword<T extends { passwordHash?: string | null; passwordSalt?: string | null }>(
    entity: T,
    password: string,
    assign: (entity: T, hash: string, salt: string) => void,
    save: () => Promise<unknown>,
  ): Promise<void> {
    if (needsPasswordInit(entity.passwordHash) && password === defaultPassword()) {
      const { hash, salt } = hashPassword(password);
      assign(entity, hash, salt);
      await save();
      return;
    }
    if (!verifyPassword(password, entity.passwordHash, entity.passwordSalt)) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }
  }

  private async findProfesorByUsuario(usuario: string): Promise<Profesor | null> {
    const u = usuario.trim().toLowerCase();
    if (!u) return null;
    const list = await this.profesorRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.taller', 't')
      .where('LOWER(TRIM(p.nombre)) = :u', { u })
      .orWhere('LOWER(TRIM(t.tipo)) = :u', { u })
      .getMany();
    return list.length > 0 ? list[0] : null;
  }

  private buildResponse(payload: JwtPayload): LoginResponse {
    const accessToken = this.jwtService.sign(payload);
    const user: AuthUserResponse = {
      id: payload.sub,
      nombre: payload.nombre,
      role: payload.role,
      tipo: payload.tipo,
      tallerId: payload.tallerId,
    };
    return { accessToken, user };
  }

  validatePayload(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
