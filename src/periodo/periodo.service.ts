import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PeriodoAcademico } from '../entities/periodo-academico.entity';
import { PeriodoAcademicoDto } from '../dto/periodo-academico.dto';

@Injectable()
export class PeriodoService {
  constructor(
    @InjectRepository(PeriodoAcademico)
    private repo: Repository<PeriodoAcademico>,
  ) {}

  async getActivo(): Promise<PeriodoAcademico | null> {
    return await this.repo.findOne({ where: { activo: true }, order: { id: 'DESC' } });
  }

  async findAll(): Promise<PeriodoAcademico[]> {
    return await this.repo.find({ order: { fechaApertura: 'DESC', id: 'DESC' } });
  }

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

  inscripcionesAbiertasEnPeriodo(periodo: PeriodoAcademico | null, hoy: string): boolean {
    if (!periodo) return true;
    const apertura = new Date(periodo.fechaApertura).toISOString().split('T')[0];
    const cierre = new Date(periodo.fechaCierre).toISOString().split('T')[0];
    return hoy >= apertura && hoy <= cierre;
  }

  mensajePeriodoCerrado(periodo: PeriodoAcademico | null, hoy: string): string | null {
    if (!periodo) return null;
    const apertura = new Date(periodo.fechaApertura).toISOString().split('T')[0];
    const cierre = new Date(periodo.fechaCierre).toISOString().split('T')[0];
    if (hoy < apertura) return `El período académico abre el ${apertura}`;
    if (hoy > cierre) return `El período académico cerró el ${cierre}`;
    return null;
  }
}
