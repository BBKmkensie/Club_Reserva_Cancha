/**
 * Servicio de períodos académicos.
 * Define el período activo de inscripciones y valida si las fechas están abiertas.
 */
import { Injectable, BadRequestException } from '@nestjs/common';
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

  /** Devuelve el período académico marcado como activo. */
  async getActivo(): Promise<PeriodoAcademico | null> {
    return await this.repo.findOne({ where: { activo: true }, order: { id: 'DESC' } });
  }

  async findAll(): Promise<PeriodoAcademico[]> {
    return await this.repo.find({ order: { id: 'DESC' } });
  }

  /** Desactiva períodos previos y crea uno nuevo como activo. */
  async configurar(dto: PeriodoAcademicoDto): Promise<PeriodoAcademico> {
    if (dto.fechaApertura > dto.fechaCierre) {
      throw new BadRequestException('La fecha de apertura debe ser anterior a la de cierre');
    }

    await this.repo.update({ activo: true }, { activo: false });

    const periodo = this.repo.create({
      nombre: dto.nombre ?? 'Período actual',
      fechaApertura: new Date(dto.fechaApertura),
      fechaCierre: new Date(dto.fechaCierre),
      activo: true,
    });
    return await this.repo.save(periodo);
  }

  /** Indica si la fecha actual cae dentro del rango del período (sin período = siempre abierto). */
  inscripcionesAbiertasEnPeriodo(periodo: PeriodoAcademico | null, hoy: string): boolean {
    if (!periodo) return true;
    const apertura = new Date(periodo.fechaApertura).toISOString().split('T')[0];
    const cierre = new Date(periodo.fechaCierre).toISOString().split('T')[0];
    return hoy >= apertura && hoy <= cierre;
  }

  /** Mensaje para el alumno si el período aún no abre o ya cerró; null si está vigente. */
  mensajePeriodoCerrado(periodo: PeriodoAcademico | null, hoy: string): string | null {
    if (!periodo) return null;
    const apertura = new Date(periodo.fechaApertura).toISOString().split('T')[0];
    const cierre = new Date(periodo.fechaCierre).toISOString().split('T')[0];
    if (hoy < apertura) return `El período académico abre el ${apertura}`;
    if (hoy > cierre) return `El período académico cerró el ${cierre}`;
    return null;
  }
}
