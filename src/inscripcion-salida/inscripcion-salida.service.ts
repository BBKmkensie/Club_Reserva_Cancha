import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InscripcionSalida } from '../entities/inscripcion-salida.entity';
import { CreateInscripcionSalidaDto } from '../dto/create-inscripcion-salida.dto';

@Injectable()
export class InscripcionSalidaService {
  constructor(
    @InjectRepository(InscripcionSalida)
    private inscripcionRepository: Repository<InscripcionSalida>,
  ) {}

  async inscribir(dto: CreateInscripcionSalidaDto): Promise<InscripcionSalida> {
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
