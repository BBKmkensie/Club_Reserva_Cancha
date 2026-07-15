/**
 * =============================================================================
 * periodo/periodo.service.ts — LÓGICA DEL PERÍODO ACADÉMICO
 * =============================================================================
 * Un PeriodoAcademico tiene:
 *   - nombre, fechaApertura, fechaCierre
 *   - activo (solo uno debería estarlo a la vez)
 *
 * Otros módulos llaman:
 *   getActivo()
 *   inscripcionesAbiertasEnPeriodo(periodo, hoy)
 *   mensajePeriodoCerrado(periodo, hoy)
 * para decidir si el alumno puede inscribirse.
 *
 * Regla: si NO hay período configurado → se considera siempre abierto.
 * =============================================================================
 */
// BadRequestException = 400 si fechaApertura > fechaCierre; NotFoundException = 404
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PeriodoAcademico } from '../entities/periodo-academico.entity';
import { PeriodoAcademicoDto } from '../dto/periodo-academico.dto';

/** Lógica de negocio para configurar y consultar períodos de inscripción. */
@Injectable()
export class PeriodoService {
  constructor(
    @InjectRepository(PeriodoAcademico)
    private repo: Repository<PeriodoAcademico>,
  ) {}

  /** Devuelve el período académico marcado como activo (el de mayor id si hay varios). */
  async getActivo(): Promise<PeriodoAcademico | null> {
    return await this.repo.findOne({ where: { activo: true }, order: { id: 'DESC' } });
  }

  /** Lista todos los períodos académicos (historial), más recientes primero. */
  async findAll(): Promise<PeriodoAcademico[]> {
    return await this.repo.find({ order: { id: 'DESC' } });
  }

  /**
   * Desactiva períodos previos y crea uno nuevo como activo.
   * Así solo queda un “vigente” a la vez.
   */
  async configurar(dto: PeriodoAcademicoDto): Promise<PeriodoAcademico> {
    if (dto.fechaApertura > dto.fechaCierre) {
      throw new BadRequestException('La fecha de apertura debe ser anterior a la de cierre');
    }

    // Apaga todos los activos actuales
    await this.repo.update({ activo: true }, { activo: false });

    const periodo = this.repo.create({
      nombre: dto.nombre ?? 'Período actual',
      fechaApertura: new Date(dto.fechaApertura),
      fechaCierre: new Date(dto.fechaCierre),
      activo: true,
    });
    return await this.repo.save(periodo);
  }

  /** Elimina un período del historial. No permite borrar el período activo. */
  async eliminar(id: number): Promise<void> {
    const periodo = await this.repo.findOne({ where: { id } });
    if (!periodo) {
      throw new NotFoundException(`Período con ID ${id} no encontrado`);
    }
    if (periodo.activo) {
      throw new BadRequestException(
        'No se puede eliminar el período activo. Configure otro período antes de borrar este.',
      );
    }
    await this.repo.delete(id);
  }

  /**
   * Indica si la fecha actual (string YYYY-MM-DD) cae dentro del rango.
   * Sin período = siempre abierto (return true).
   */
  inscripcionesAbiertasEnPeriodo(periodo: PeriodoAcademico | null, hoy: string): boolean {
    if (!periodo) return true;
    const apertura = new Date(periodo.fechaApertura).toISOString().split('T')[0];
    const cierre = new Date(periodo.fechaCierre).toISOString().split('T')[0];
    return hoy >= apertura && hoy <= cierre;
  }

  /**
   * Mensaje para el alumno si el período aún no abre o ya cerró.
   * null = está vigente (o no hay período).
   */
  mensajePeriodoCerrado(periodo: PeriodoAcademico | null, hoy: string): string | null {
    if (!periodo) return null;
    const apertura = new Date(periodo.fechaApertura).toISOString().split('T')[0];
    const cierre = new Date(periodo.fechaCierre).toISOString().split('T')[0];
    if (hoy < apertura) return `El período académico abre el ${apertura}`;
    if (hoy > cierre) return `El período académico cerró el ${cierre}`;
    return null;
  }
}
