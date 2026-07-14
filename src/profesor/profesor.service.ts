/**
 * =============================================================================
 * profesor/profesor.service.ts — LÓGICA CRUD + LOGIN LEGACY
 * =============================================================================
 * Tabla: `profesores` (cada profesor tiene tallerId obligatorio).
 *
 * create(): hashea password si viene; INSERT
 * findOne(): trae relations taller + salidas
 * login(): compatibilidad antigua — hoy AuthService.loginProfesor es el canónico
 *   - sin hash + password '12345' → setPasswordToDefault
 *   - con hash → verifyPassword PBKDF2
 *   - retorna el profesor SIN passwordHash/passwordSalt (Omit)
 * =============================================================================
 */

// Injectable = Nest DI; NotFoundException = 404; UnauthorizedException = 401.
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

// InjectRepository = pide Repository<Profesor>.
import { InjectRepository } from '@nestjs/typeorm';

// Repository = consultas TypeORM sobre la tabla.
import { Repository } from 'typeorm';

// Profesor = entidad (= fila de `profesores`).
import { Profesor } from '../entities/profesor.entity';

// CreateProfesorDto = datos de creación validados.
import { CreateProfesorDto } from '../dto/create-profesor.dto';

// buscarProfesorPorUsuario = busca por email, RUT, nombre o taller.
import { buscarProfesorPorUsuario } from '../common/profesor-lookup.util';

// crypto = randomBytes (salt) + pbkdf2Sync (hash de password).
import * as crypto from 'crypto';

/**
 * ProfesorService:
 *   - CRUD de profesores
 *   - login() legacy (compatibilidad; el canónico es AuthService)
 */
@Injectable()
export class ProfesorService {
  /**
   * constructor:
   *   profesorRepository = acceso a tabla `profesores`.
   */
  constructor(
    @InjectRepository(Profesor)
    private profesorRepository: Repository<Profesor>,
  ) {}

  /**
   * create = crea profesor; password opcional (si viene, se hashea con PBKDF2).
   */
  async create(createProfesorDto: CreateProfesorDto): Promise<Profesor> {
    // Campos base (sin password aún)
    const profesorData: any = {
      nombre: createProfesorDto.nombre,
      rut: createProfesorDto.rut,
      email: createProfesorDto.email,
      telefono: createProfesorDto.telefono,
      fotoPath: createProfesorDto.fotoPath,
      tallerId: createProfesorDto.tallerId,
    };

    if (createProfesorDto.password) {
      // Salt aleatorio + PBKDF2-SHA512 (mismo esquema que admin)
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto
        .pbkdf2Sync(createProfesorDto.password, salt, 1000, 64, 'sha512')
        .toString('hex');
      profesorData.passwordHash = hash;
      profesorData.passwordSalt = salt;
    }

    const profesor = this.profesorRepository.create(profesorData);
    const saved = await this.profesorRepository.save(profesor);
    // Normalizamos por si TypeORM tipa save como array
    if (Array.isArray(saved)) {
      return saved[0];
    }
    return saved;
  }

  /** findAll = lista profesores con su taller (JOIN). */
  async findAll(): Promise<Profesor[]> {
    return await this.profesorRepository.find({ relations: ['taller'] });
  }

  /** findOne = incluye taller y salidas asociadas al profesor; 404 si no existe. */
  async findOne(id: number): Promise<Profesor> {
    const profesor = await this.profesorRepository.findOne({
      where: { id },
      relations: ['taller', 'salidas'],
    });
    if (!profesor) {
      throw new NotFoundException(`Profesor con ID ${id} no encontrado`);
    }
    return profesor;
  }

  /** findByTaller = profesores de un taller concreto. */
  async findByTaller(tallerId: number): Promise<Profesor[]> {
    return await this.profesorRepository.find({
      where: { tallerId },
      relations: ['taller'],
    });
  }

  /** update = actualización parcial (Object.assign + save). */
  async update(
    id: number,
    updateProfesorDto: Partial<CreateProfesorDto>,
  ): Promise<Profesor> {
    const profesor = await this.findOne(id);
    Object.assign(profesor, updateProfesorDto);
    return await this.profesorRepository.save(profesor);
  }

  /** remove = elimina profesor de la BD. */
  async remove(id: number): Promise<void> {
    const profesor = await this.findOne(id);
    await this.profesorRepository.remove(profesor);
  }

  /** findByUsuario = busca por email o RUT (utilidad compartida con AuthService). */
  async findByUsuario(usuario: string): Promise<Profesor | null> {
    return buscarProfesorPorUsuario(this.profesorRepository, usuario);
  }

  /**
   * verifyPassword (privado):
   * Compara password con hash almacenado; sin hash solo acepta '12345'.
   */
  private verifyPassword(profesor: Profesor, password: string): boolean {
    if (!profesor.passwordHash || !profesor.passwordSalt) {
      // Usuario sin hash inicializado → solo clave temporal
      return password === '12345';
    }
    // Recalcula PBKDF2 con el salt guardado y compara
    const hash = crypto
      .pbkdf2Sync(password, profesor.passwordSalt, 1000, 64, 'sha512')
      .toString('hex');
    return hash === profesor.passwordHash;
  }

  /**
   * setPasswordToDefault (privado):
   * Primer acceso: guarda hash de '12345' para no dejar password vacía.
   */
  private async setPasswordToDefault(profesor: Profesor): Promise<void> {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync('12345', salt, 1000, 64, 'sha512')
      .toString('hex');
    profesor.passwordHash = hash;
    profesor.passwordSalt = salt;
    await this.profesorRepository.save(profesor);
  }

  /**
   * login = login directo del módulo profesor (compatibilidad).
   * Devuelve el profesor sin campos sensibles de password.
   *
   * Omit<Profesor, 'passwordHash' | 'passwordSalt'> =
   *   el tipo Profesor pero SIN esas dos propiedades.
   */
  async login(
    usuario: string,
    password: string,
  ): Promise<Omit<Profesor, 'passwordHash' | 'passwordSalt'>> {
    const profesor = await this.findByUsuario(usuario);
    if (!profesor) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }
    // Primer acceso: sin hash + clave temporal → inicializar hash
    if (!profesor.passwordHash && password === '12345') {
      await this.setPasswordToDefault(profesor);
    } else if (!this.verifyPassword(profesor, password)) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }
    // Desestructura para NO devolver hash/salt al cliente
    const { passwordHash, passwordSalt, ...rest } = profesor;
    return rest as Omit<Profesor, 'passwordHash' | 'passwordSalt'>;
  }
}
