/**
 * =============================================================================
 * admin/admin.service.ts — LÓGICA CRUD DE ADMINISTRADORES
 * =============================================================================
 * Habla con PostgreSQL vía TypeORM Repository<Admin>.
 *
 * create():
 *   1) Genera salt aleatorio
 *   2) Hashea password con PBKDF2-SHA512
 *   3) Guarda fila en tabla `admin` (sin guardar la password en texto plano)
 *
 * findOne / remove: si no existe → NotFoundException (HTTP 404)
 * findByEmail: usado también por otros flujos (login / búsqueda)
 * =============================================================================
 */

// Injectable = Nest puede inyectar este service; NotFoundException = HTTP 404.
import { Injectable, NotFoundException } from '@nestjs/common';

// InjectRepository = pide Repository<Admin> (requiere forFeature en el módulo).
import { InjectRepository } from '@nestjs/typeorm';

// Repository = find / findOne / create / save / remove sobre la tabla.
import { Repository } from 'typeorm';

// Admin = entidad (= fila de la tabla `admin`).
import { Admin } from '../entities/admin.entity';

// CreateAdminDto = datos de entrada validados (nombre, rut, email, password...).
import { CreateAdminDto } from '../dto/create-admin.dto';

// crypto = Node.js: randomBytes (salt) + pbkdf2Sync (hash de password).
import * as crypto from 'crypto';

/**
 * AdminService:
 *   - Toda la lógica CRUD de administradores
 *   - Nunca guarda la password en texto plano (solo hash + salt)
 */
@Injectable()
export class AdminService {
  /**
   * constructor:
   *   adminRepository = acceso a tabla `admin` vía TypeORM.
   */
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
  ) {}

  /**
   * create = crea un admin con contraseña hasheada.
   * Nunca se guarda createAdminDto.password tal cual: solo hash + salt.
   */
  async create(createAdminDto: CreateAdminDto): Promise<Admin> {
    // Salt = valor aleatorio único por usuario (evita rainbow tables)
    const salt = crypto.randomBytes(16).toString('hex');
    // PBKDF2: 1000 iteraciones, 64 bytes, SHA-512 → string hex
    const hash = crypto
      .pbkdf2Sync(createAdminDto.password, salt, 1000, 64, 'sha512')
      .toString('hex');

    // create() de TypeORM arma la entidad en memoria (aún no INSERT)
    const admin = this.adminRepository.create({
      nombre: createAdminDto.nombre,
      rut: createAdminDto.rut,
      email: createAdminDto.email,
      passwordHash: hash,
      passwordSalt: salt,
    });

    // save() ejecuta el INSERT en PostgreSQL y retorna la fila guardada
    return await this.adminRepository.save(admin);
  }

  /** findAll = SELECT * FROM admin */
  async findAll(): Promise<Admin[]> {
    return await this.adminRepository.find();
  }

  /** findOne = SELECT ... WHERE id = ? ; si no hay fila → 404 */
  async findOne(id: number): Promise<Admin> {
    const admin = await this.adminRepository.findOne({ where: { id } });
    if (!admin) {
      throw new NotFoundException(`Admin con ID ${id} no encontrado`);
    }
    return admin;
  }

  /** findByEmail = busca por email (útil para login / validaciones). null si no existe. */
  async findByEmail(email: string): Promise<Admin | null> {
    return await this.adminRepository.findOne({ where: { email } });
  }

  /** remove = DELETE: primero findOne (404 si no existe), luego remove. */
  async remove(id: number): Promise<void> {
    const admin = await this.findOne(id);
    await this.adminRepository.remove(admin);
  }
}
