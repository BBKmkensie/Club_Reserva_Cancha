/**
 * =============================================================================
 * inscripcion-salida/inscripcion-salida.service.ts — LÓGICA DE INSCRIPCIÓN
 * =============================================================================
 * Reglas de negocio al inscribir:
 *   1. La salida debe existir
 *   2. Su estado debe ser visible para estudiantes (PUBLICADA / EN_CURSO / CERRADA)
 *   3. El alumno debe estar en un taller (inscripción ACEPTADA o tallerId propio)
 *   4. Ese taller debe ser el mismo de la salida
 *   5. No puede estar ya inscrito (ConflictException)
 *
 * TypeORM: findOne({ where }) busca; create()+save() inserta; remove() borra.
 * =============================================================================
 */
import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InscripcionSalida } from '../entities/inscripcion-salida.entity';
import { InscripcionTaller } from '../entities/inscripcion-taller.entity';
import { Salida } from '../entities/salida.entity';
import { CreateInscripcionSalidaDto } from '../dto/create-inscripcion-salida.dto';
import { ESTADOS_SALIDA_VISIBLES_ESTUDIANTE } from '../salida/salida.types';

/** Lógica de negocio para inscribir alumnos en salidas de sus talleres. */
@Injectable()
export class InscripcionSalidaService {
  constructor(
    @InjectRepository(InscripcionSalida)
    private inscripcionRepository: Repository<InscripcionSalida>,
    @InjectRepository(InscripcionTaller)
    private inscripcionTallerRepository: Repository<InscripcionTaller>,
    @InjectRepository(Salida)
    private salidaRepository: Repository<Salida>,
  ) {}

  /**
   * Talleres donde el alumno tiene inscripción ACEPTADA.
   * find({ where: { alumnoId, estado: 'ACEPTADO' } }) → Set de tallerIds.
   */
  private async talleresInscritosAlumno(alumnoId: number): Promise<Set<number>> {
    const inscripciones = await this.inscripcionTallerRepository.find({
      where: { alumnoId, estado: 'ACEPTADO' },
    });
    return new Set(inscripciones.map((i) => i.tallerId).filter((id) => id != null));
  }

  /**
   * Inscribe al alumno si la salida está publicada y pertenece a su taller.
   * Flujo: findOne(salida) → validaciones → create() + save().
   */
  async inscribir(dto: CreateInscripcionSalidaDto): Promise<InscripcionSalida> {
    // findOne({ where: { id } }) — 404 si no existe
    const salida = await this.salidaRepository.findOne({ where: { id: dto.salidaId } });
    if (!salida) throw new NotFoundException('Salida no encontrada');

    // Solo estados visibles (no pendientes ni rechazadas)
    if (!ESTADOS_SALIDA_VISIBLES_ESTUDIANTE.includes(salida.estado as any)) {
      throw new ForbiddenException('Esta salida no está disponible para inscripción');
    }

    const talleresAlumno = await this.talleresInscritosAlumno(dto.alumnoId);
    if (!talleresAlumno.size) {
      throw new ForbiddenException(
        'Debes estar inscrito en un taller para ver o inscribirte en salidas',
      );
    }
    // El taller de la salida debe estar en el set del alumno
    if (!talleresAlumno.has(salida.tallerId)) {
      throw new ForbiddenException(
        'Solo puedes inscribirte en salidas del taller donde estás inscrito',
      );
    }

    // Evita duplicados alumno+salida (unique de negocio)
    const existente = await this.inscripcionRepository.findOne({
      where: { alumnoId: dto.alumnoId, salidaId: dto.salidaId },
    });
    if (existente) {
      throw new ConflictException('El alumno ya está inscrito en esta salida');
    }
    // create() en memoria + save() = INSERT
    const inscripcion = this.inscripcionRepository.create({
      alumnoId: dto.alumnoId,
      salidaId: dto.salidaId,
    });
    return await this.inscripcionRepository.save(inscripcion);
  }

  /** Lista inscritos de una salida (find + relations alumno/salida). */
  async findBySalida(salidaId: number): Promise<InscripcionSalida[]> {
    return await this.inscripcionRepository.find({
      where: { salidaId },
      relations: ['alumno', 'salida'],
    });
  }

  /** Lista salidas en las que está inscrito el alumno. */
  async findByAlumno(alumnoId: number): Promise<InscripcionSalida[]> {
    return await this.inscripcionRepository.find({
      where: { alumnoId },
      relations: ['alumno', 'salida', 'salida.taller'],
    });
  }

  /**
   * Cancela inscripción: findOne por clave compuesta → remove() = DELETE.
   */
  async remove(alumnoId: number, salidaId: number): Promise<void> {
    const inscripcion = await this.inscripcionRepository.findOne({
      where: { alumnoId, salidaId },
    });
    if (!inscripcion) {
      throw new NotFoundException('Inscripción no encontrada');
    }
    await this.inscripcionRepository.remove(inscripcion);
  }
}
