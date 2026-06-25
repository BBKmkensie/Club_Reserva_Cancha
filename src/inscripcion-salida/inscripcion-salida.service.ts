import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InscripcionSalida } from '../entities/inscripcion-salida.entity';
import { InscripcionTaller } from '../entities/inscripcion-taller.entity';
import { Alumno } from '../entities/alumno.entity';
import { Salida } from '../entities/salida.entity';
import { CreateInscripcionSalidaDto } from '../dto/create-inscripcion-salida.dto';
import { ESTADOS_SALIDA_VISIBLES_ESTUDIANTE } from '../salida/salida.types';

@Injectable()
export class InscripcionSalidaService {
  constructor(
    @InjectRepository(InscripcionSalida)
    private inscripcionRepository: Repository<InscripcionSalida>,
    @InjectRepository(InscripcionTaller)
    private inscripcionTallerRepository: Repository<InscripcionTaller>,
    @InjectRepository(Alumno)
    private alumnoRepository: Repository<Alumno>,
    @InjectRepository(Salida)
    private salidaRepository: Repository<Salida>,
  ) {}

  private async talleresInscritosAlumno(alumnoId: number): Promise<Set<number>> {
    const inscripciones = await this.inscripcionTallerRepository.find({
      where: { alumnoId, estado: 'ACEPTADO' },
    });
    const ids = new Set(inscripciones.map((i) => i.tallerId));
    const alumno = await this.alumnoRepository.findOne({ where: { id: alumnoId } });
    if (alumno?.tallerId) ids.add(alumno.tallerId);
    return ids;
  }

  async inscribir(dto: CreateInscripcionSalidaDto): Promise<InscripcionSalida> {
    const salida = await this.salidaRepository.findOne({ where: { id: dto.salidaId } });
    if (!salida) throw new NotFoundException('Salida no encontrada');

    if (!ESTADOS_SALIDA_VISIBLES_ESTUDIANTE.includes(salida.estado as any)) {
      throw new ForbiddenException('Esta salida no está disponible para inscripción');
    }

    const talleresAlumno = await this.talleresInscritosAlumno(dto.alumnoId);
    if (!talleresAlumno.size) {
      throw new ForbiddenException(
        'Debes estar inscrito en un taller para ver o inscribirte en salidas',
      );
    }
    if (!talleresAlumno.has(salida.tallerId)) {
      throw new ForbiddenException(
        'Solo puedes inscribirte en salidas del taller donde estás inscrito',
      );
    }

    const existente = await this.inscripcionRepository.findOne({
      where: { alumnoId: dto.alumnoId, salidaId: dto.salidaId },
    });
    if (existente) {
      throw new ConflictException('El alumno ya está inscrito en esta salida');
    }
    const inscripcion = this.inscripcionRepository.create({
      alumnoId: dto.alumnoId,
      salidaId: dto.salidaId,
    });
    return await this.inscripcionRepository.save(inscripcion);
  }

  async findBySalida(salidaId: number): Promise<InscripcionSalida[]> {
    return await this.inscripcionRepository.find({
      where: { salidaId },
      relations: ['alumno', 'salida'],
    });
  }

  async findByAlumno(alumnoId: number): Promise<InscripcionSalida[]> {
    return await this.inscripcionRepository.find({
      where: { alumnoId },
      relations: ['alumno', 'salida', 'salida.taller'],
    });
  }

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
