/**
 * =============================================================================
 * alumno/alumno.service.ts — LÓGICA CRUD DE ALUMNOS
 * =============================================================================
 * Tabla: `alumnos`
 * Nota: el apoderado NO es otra tabla; sus datos viven en columnas apoderado_*
 * de la misma fila (ver alumno.entity.ts). Aquí el CRUD es del alumno.
 *
 * create(): valida edad, hashea password (o usa la por defecto '12345'), INSERT
 * findAll/findOne: relations: ['taller'] → JOIN para traer el taller asociado
 * update(): Object.assign + save; tallerId puede quedar null
 * =============================================================================
 */

// Injectable = Nest DI; NotFoundException = 404; BadRequestException = 400.
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

// InjectRepository = pide Repository<Alumno>.
import { InjectRepository } from '@nestjs/typeorm';

// Repository = consultas TypeORM sobre la tabla.
import { Repository } from 'typeorm';

// Alumno = entidad (= fila de `alumnos`).
import { Alumno } from '../entities/alumno.entity';

// CreateAlumnoDto = datos de entrada validados.
import { CreateAlumnoDto } from '../dto/create-alumno.dto';

// Constantes / validación de rango de edad del colegio.
import {
  edadAlumnoValida,
  EDAD_ALUMNO_MIN,
  EDAD_ALUMNO_MAX,
} from '../common/alumno-edad.constants';

// defaultPassword / hashPassword = clave temporal '12345' y PBKDF2.
import { defaultPassword, hashPassword } from '../common/password.util';

/**
 * AlumnoService:
 *   - CRUD de alumnos + validación de edad + hash de password
 */
@Injectable()
export class AlumnoService {
  /**
   * constructor:
   *   alumnoRepository = acceso a tabla `alumnos`.
   */
  constructor(
    @InjectRepository(Alumno)
    private alumnoRepository: Repository<Alumno>,
  ) {}

  /**
   * create = crea alumno.
   * - Valida rango de edad (constantes del colegio).
   * - Si mandan password → la hashea; si no → usa defaultPassword() ('12345').
   * - tallerId opcional (null = sin taller principal legado).
   */
  async create(createAlumnoDto: CreateAlumnoDto): Promise<Alumno> {
    // Si la edad viene y está fuera de rango → 400
    this.validarEdad(createAlumnoDto.edad);

    // Armamos el objeto que irá a la BD (aún sin hash)
    const alumnoData: any = {
      nombre: createAlumnoDto.nombre,
      rut: createAlumnoDto.rut,
      email: createAlumnoDto.email,
      telefono: createAlumnoDto.telefono,
      edad: createAlumnoDto.edad,
      tallerId: createAlumnoDto.tallerId ?? null,
    };

    if (createAlumnoDto.password) {
      // Password explícita → hashear
      const { hash, salt } = hashPassword(createAlumnoDto.password);
      alumnoData.passwordHash = hash;
      alumnoData.passwordSalt = salt;
    } else {
      // Primer acceso típico: contraseña temporal del sistema
      const { hash, salt } = hashPassword(defaultPassword());
      alumnoData.passwordHash = hash;
      alumnoData.passwordSalt = salt;
    }

    await this.aplicarApoderadoOpcional(alumnoData, createAlumnoDto);

    // create = entidad en memoria; save = INSERT
    const alumno = this.alumnoRepository.create(alumnoData);
    const saved = await this.alumnoRepository.save(alumno);
    // TypeORM a veces tipa save como entidad | entidad[]; normalizamos a una
    if (Array.isArray(saved)) {
      return saved[0];
    }
    return saved;
  }

  /** findAll = lista alumnos incluyendo la relación `taller` (JOIN). */
  async findAll(): Promise<Alumno[]> {
    return await this.alumnoRepository.find({ relations: ['taller'] });
  }

  /** findOne = un alumno por id + taller; 404 si no existe. */
  async findOne(id: number): Promise<Alumno> {
    const alumno = await this.alumnoRepository.findOne({
      where: { id },
      relations: ['taller'],
    });
    if (!alumno) {
      throw new NotFoundException(`Alumno con ID ${id} no encontrado`);
    }
    return alumno;
  }

  /** findByTaller = alumnos cuyo taller_id (legado) coincide. */
  async findByTaller(tallerId: number): Promise<Alumno[]> {
    return await this.alumnoRepository.find({
      where: { tallerId },
      relations: ['taller'],
    });
  }

  /**
   * update = actualización parcial.
   * Separa tallerId del resto para poder poner null explícitamente.
   */
  async update(
    id: number,
    updateAlumnoDto: Partial<CreateAlumnoDto>,
  ): Promise<Alumno> {
    // Si mandan edad, validarla antes de tocar la BD
    if (updateAlumnoDto.edad !== undefined) {
      this.validarEdad(updateAlumnoDto.edad);
    }
    const alumno = await this.findOne(id);
    const {
      tallerId,
      apoderadoNombre: _an,
      apoderadoRut: _ar,
      apoderadoEmail: _ae,
      apoderadoTelefono: _at,
      apoderadoPassword: _ap,
      ...rest
    } = updateAlumnoDto;
    Object.assign(alumno, rest);
    if (tallerId !== undefined) alumno.tallerId = tallerId ?? null;
    await this.aplicarApoderadoOpcional(alumno, updateAlumnoDto, id);
    return await this.alumnoRepository.save(alumno);
  }

  /** remove = elimina alumno de la BD. */
  async remove(id: number): Promise<void> {
    const alumno = await this.findOne(id);
    await this.alumnoRepository.remove(alumno);
  }

  /**
   * validarEdad (privado):
   * Si edad viene definida y está fuera de rango → BadRequestException (400).
   */
  private validarEdad(edad?: number): void {
    if (edad == null) return;
    if (!edadAlumnoValida(edad)) {
      throw new BadRequestException(
        `La edad debe estar entre ${EDAD_ALUMNO_MIN} y ${EDAD_ALUMNO_MAX} años`,
      );
    }
  }

  /** Aplica datos de apoderado si vienen nombre y RUT; hashea contraseña opcional. */
  private async aplicarApoderadoOpcional(
    target: Record<string, unknown>,
    dto: Partial<CreateAlumnoDto>,
    excludeAlumnoId?: number,
  ): Promise<void> {
    const nombre = dto.apoderadoNombre?.trim();
    const rut = dto.apoderadoRut?.trim();
    const tieneCamposApoderado =
      dto.apoderadoNombre !== undefined ||
      dto.apoderadoRut !== undefined ||
      dto.apoderadoEmail !== undefined ||
      dto.apoderadoTelefono !== undefined ||
      dto.apoderadoPassword !== undefined;

    if (!tieneCamposApoderado) return;

    if (!nombre || !rut) {
      throw new BadRequestException(
        'Si registra un apoderado, indique al menos nombre y RUT',
      );
    }

    await this.validarApoderadoRutUnico(rut, excludeAlumnoId);

    target.apoderadoNombre = nombre;
    target.apoderadoRut = rut;
    target.apoderadoEmail = dto.apoderadoEmail?.trim() || null;
    target.apoderadoTelefono = dto.apoderadoTelefono?.trim() || null;

    if (dto.apoderadoPassword?.trim()) {
      const { hash, salt } = hashPassword(dto.apoderadoPassword.trim());
      target.apoderadoPasswordHash = hash;
      target.apoderadoPasswordSalt = salt;
    } else if (!excludeAlumnoId) {
      const { hash, salt } = hashPassword(defaultPassword());
      target.apoderadoPasswordHash = hash;
      target.apoderadoPasswordSalt = salt;
    }
  }

  private async validarApoderadoRutUnico(rut: string, excludeAlumnoId?: number): Promise<void> {
    const existente = await this.alumnoRepository.findOne({ where: { apoderadoRut: rut } });
    if (existente && existente.id !== excludeAlumnoId) {
      throw new BadRequestException('El RUT del apoderado ya está asociado a otro alumno');
    }
  }
}
