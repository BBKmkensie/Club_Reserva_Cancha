/**
 * =============================================================================
 * 4.3 auth.service.ts — LÓGICA REAL DEL LOGIN + EMISIÓN DEL JWT
 * =============================================================================
 * Flujo general:
 *   AuthController.login(dto)
 *     → AuthService.login(dto)
 *       → loginAdmin / loginProfesor / loginAlumno / loginApoderado / loginUnified
 *         → ensurePassword()  (valida o inicializa hash)
 *         → buildResponse()   (firma JWT y arma { accessToken, user })
 *
 * Tablas usadas:
 *   - admin      (email + password)
 *   - profesores (email/RUT + password)
 *   - alumnos    (RUT alumno + también credenciales del apoderado en la misma fila)
 * =============================================================================
 */

// Injectable = Nest puede inyectar este service; UnauthorizedException = HTTP 401.
import { Injectable, UnauthorizedException } from '@nestjs/common';

// JwtService = firma el accessToken (viene de JwtModule).
import { JwtService } from '@nestjs/jwt';

// InjectRepository = pide un Repository TypeORM de una entidad.
import { InjectRepository } from '@nestjs/typeorm';

// Repository = API de consultas (findOne, save, etc.) sobre una tabla.
import { Repository } from 'typeorm';

// Entidades = filas de las tablas usadas en el login.
import { Admin } from '../entities/admin.entity';
import { Profesor } from '../entities/profesor.entity';
import { Alumno } from '../entities/alumno.entity';

// LoginDto = body validado { usuario, password, tipo? }.
import { LoginDto } from '../dto/login.dto';

// Utilidades de hash (PBKDF2): hashear, verificar, detectar primer acceso, clave default.
import {
  hashPassword,
  verifyPassword,
  needsPasswordInit,
  defaultPassword,
} from '../common/password.util';

// Tipos de respuesta / payload JWT compartidos en el módulo auth.
import {
  AuthUserResponse,
  JwtPayload,
  LoginResponse,
} from './auth.types';

// buscarProfesorPorUsuario = busca profesor por email, RUT, nombre o taller.
import { buscarProfesorPorUsuario } from '../common/profesor-lookup.util';

/**
 * AuthService:
 *   - Punto central del login (todos los perfiles)
 *   - Firma el JWT y arma { accessToken, user }
 *   - validatePayload() lo usa JwtStrategy en cada request autenticada
 */
@Injectable()
export class AuthService {
  /**
   * Inyección de repositorios TypeORM:
   *   adminRepo     → tabla admin
   *   profesorRepo  → tabla profesores
   *   alumnoRepo    → tabla alumnos
   *   jwtService    → firma el token (JwtModule)
   *
   * @InjectRepository(Entidad) solo funciona si AuthModule hizo
   * TypeOrmModule.forFeature([Admin, Profesor, Alumno]).
   */
  constructor(
    @InjectRepository(Admin)
    private adminRepo: Repository<Admin>,
    @InjectRepository(Profesor)
    private profesorRepo: Repository<Profesor>,
    @InjectRepository(Alumno)
    private alumnoRepo: Repository<Alumno>,
    private jwtService: JwtService,
  ) {}

  /**
   * login(dto) = punto de entrada del login (lo llama AuthController).
   *
   * Dos modos:
   *   A) Sin dto.tipo → loginUnified(): adivina si es admin/profesor/apoderado/alumno
   *   B) Con dto.tipo → switch al flujo exacto (admin, directiva, profesor, alumno, apoderado)
   */
  async login(dto: LoginDto): Promise<LoginResponse> {
    // Modo A: el frontend no mandó "tipo" → detección automática
    if (!dto.tipo) {
      return this.loginUnified(dto.usuario, dto.password);
    }

    // Modo B: el frontend dijo explícitamente qué perfil es
    switch (dto.tipo) {
      case 'admin':
        // Solo acepta filas admin con rol super_admin
        return this.loginAdmin(dto.usuario, dto.password, 'super_admin');
      case 'directiva':
        // Solo acepta filas admin con rol directiva
        return this.loginAdmin(dto.usuario, dto.password, 'directiva');
      case 'profesor':
        return this.loginProfesor(dto.usuario, dto.password);
      case 'alumno':
        return this.loginAlumno(dto.usuario, dto.password);
      case 'apoderado': {
        // El apoderado entra con su RUT; buscamos el alumno que lo tiene asociado
        const rut = dto.usuario.trim();
        const alumno = await this.alumnoRepo.findOne({
          where: { apoderadoRut: rut },
        });
        if (!alumno) {
          throw new UnauthorizedException('RUT o contraseña incorrectos');
        }
        return this.loginApoderado(alumno, dto.password);
      }
      default:
        throw new UnauthorizedException('Tipo de usuario no válido');
    }
  }

  /**
   * loginUnified (sin tipo):
   * Orden de intento:
   *   1) Si el usuario tiene "@" → buscar admin por email
   *   2) Intentar profesor (email o RUT)
   *   3) Intentar apoderado (RUT en alumnos.apoderado_rut)
   *   4) Intentar alumno (RUT en alumnos.rut)
   */
  private async loginUnified(
    usuario: string,
    password: string,
  ): Promise<LoginResponse> {
    const email = usuario.trim().toLowerCase();

    // 1) ¿Parece un email de admin?
    if (email.includes('@')) {
      const admin = await this.adminRepo.findOne({ where: { email } });
      if (admin) {
        return this.loginAdmin(usuario, password);
      }
    }

    // 2) ¿Es profesor? Si falla la contraseña/usuario, catch y seguimos
    try {
      return await this.loginProfesor(usuario, password);
    } catch {
      // No es profesor (o credenciales malas para profesor); probar otros perfiles
    }

    // 3) ¿Es apoderado? (RUT guardado en la fila del alumno)
    const rut = usuario.trim();
    const apoderadoAlumno = await this.alumnoRepo.findOne({
      where: { apoderadoRut: rut },
    });
    if (apoderadoAlumno) {
      return this.loginApoderado(apoderadoAlumno, password);
    }

    // 4) Último recurso: alumno por RUT
    return this.loginAlumno(usuario, password);
  }

  /**
   * loginAdmin = Admin o Directiva (ambos viven en la tabla `admin`).
   * expectedRol (opcional): si el cliente mandó tipo=admin o tipo=directiva,
   * el rol en BD DEBE coincidir; si no, se rechaza.
   */
  private async loginAdmin(
    usuario: string,
    password: string,
    expectedRol?: 'super_admin' | 'directiva',
  ): Promise<LoginResponse> {
    const email = usuario.trim().toLowerCase();
    // Busca por email en tabla admin
    const admin = await this.adminRepo.findOne({ where: { email } });
    if (!admin) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    // Si el cliente pidió "admin" pero en BD es "directiva" (o viceversa) → rechazar
    if (expectedRol === 'super_admin' && admin.rol !== 'super_admin') {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }
    if (expectedRol === 'directiva' && admin.rol !== 'directiva') {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    // Valida password (o inicializa hash si es primer acceso con '12345')
    await this.ensurePassword(
      admin,
      password,
      // callback assign: escribe hash/salt en la entidad
      (entity, hash, salt) => {
        entity.passwordHash = hash;
        entity.passwordSalt = salt;
      },
      // callback save: persiste en BD
      () => this.adminRepo.save(admin),
    );

    // Mapeo interno:
    //   rol BD super_admin → JWT role=super_admin, tipo=admin
    //   rol BD directiva   → JWT role=admin,        tipo=directiva
    const isSuper = admin.rol === 'super_admin';
    return this.buildResponse({
      sub: admin.id,
      role: isSuper ? 'super_admin' : 'admin',
      tipo: isSuper ? 'admin' : 'directiva',
      nombre: admin.nombre,
    });
  }

  /**
   * loginProfesor:
   * En el JWT recibe role='admin' (permisos operativos) pero tipo='profesor'
   * y tallerId para acotar lo que puede gestionar.
   */
  private async loginProfesor(
    usuario: string,
    password: string,
  ): Promise<LoginResponse> {
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

    // Profesores operan con permisos de admin acotados al taller
    return this.buildResponse({
      sub: profesor.id,
      role: 'admin',
      tipo: 'profesor',
      tallerId: profesor.tallerId,
      nombre: profesor.nombre,
    });
  }

  /**
   * loginAlumno: usuario = RUT del alumno.
   * JWT: role='usuario', tipo='alumno'.
   */
  private async loginAlumno(
    usuario: string,
    password: string,
  ): Promise<LoginResponse> {
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
      // ?? undefined: si tallerId es null, no lo incluye en el payload
      tallerId: alumno.tallerId ?? undefined,
      nombre: alumno.nombre,
    });
  }

  /**
   * loginApoderado:
   * IMPORTANTE: NO hay tabla "apoderados".
   * Las credenciales están en columnas del alumno:
   *   apoderado_password_hash / apoderado_password_salt / apoderado_nombre / apoderado_rut
   * El JWT usa sub = id del alumno (hijo), tipo = 'apoderado'.
   */
  private async loginApoderado(
    alumno: Alumno,
    password: string,
  ): Promise<LoginResponse> {
    await this.ensurePassword(
      {
        // Objeto temporal con las credenciales del apoderado
        passwordHash: alumno.apoderadoPasswordHash,
        passwordSalt: alumno.apoderadoPasswordSalt,
      },
      password,
      // Al asignar, escribimos de vuelta en la fila del alumno
      (_, hash, salt) => {
        alumno.apoderadoPasswordHash = hash;
        alumno.apoderadoPasswordSalt = salt;
      },
      () => this.alumnoRepo.save(alumno),
    );

    return this.buildResponse({
      sub: alumno.id,
      role: 'usuario',
      tipo: 'apoderado',
      tallerId: alumno.tallerId ?? undefined,
      nombre: alumno.apoderadoNombre ?? `Apoderado de ${alumno.nombre}`,
    });
  }

  /**
   * ensurePassword = "asegúrate de que la contraseña sea válida".
   *
   * Caso 1 — Primer acceso (hash vacío o placeholder 'hash'):
   *   Si la password enviada es la por defecto ('12345'),
   *   genera hash+salt, los guarda y deja pasar.
   *
   * Caso 2 — Ya tiene hash:
   *   Compara con verifyPassword; si no coincide → UnauthorizedException.
   *
   * Es genérico (<T>) para servir admin, profesor, alumno y apoderado.
   * "assign" y "save" son callbacks porque cada entidad guarda distinto.
   */
  private async ensurePassword<
    T extends { passwordHash?: string | null; passwordSalt?: string | null },
  >(
    entity: T,
    password: string,
    assign: (entity: T, hash: string, salt: string) => void,
    save: () => Promise<unknown>,
  ): Promise<void> {
    // Primer acceso: aún no hay hash real y usaron la clave temporal
    if (needsPasswordInit(entity.passwordHash) && password === defaultPassword()) {
      const { hash, salt } = hashPassword(password);
      assign(entity, hash, salt);
      await save();
      return;
    }
    // Acceso normal: verificar hash almacenado
    if (!verifyPassword(password, entity.passwordHash, entity.passwordSalt)) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }
  }

  /** Busca profesor por email o RUT (utilidad compartida). */
  private async findProfesorByUsuario(
    usuario: string,
  ): Promise<Profesor | null> {
    return buscarProfesorPorUsuario(this.profesorRepo, usuario);
  }

  /**
   * buildResponse = firma el JWT y arma la respuesta estándar del login.
   *
   * accessToken = string que el frontend guarda (localStorage) y envía en:
   *   Authorization: Bearer <accessToken>
   *
   * user = datos públicos para mostrar en la UI (sin password).
   */
  private buildResponse(payload: JwtPayload): LoginResponse {
    // jwtService.sign escribe el payload cifrado/firmado con jwt.secret
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

  /**
   * validatePayload = hook usado por JwtStrategy.validate().
   * Hoy solo retorna el payload; sirve como único punto para
   * agregar validaciones extra en el futuro (ej. usuario desactivado).
   */
  validatePayload(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
