import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InscripcionTaller } from '../entities/inscripcion-taller.entity';
import { CreateInscripcionTallerDto } from '../dto/create-inscripcion-taller.dto';
import { ResponderInscripcionTallerDto } from '../dto/responder-inscripcion-taller.dto';

@Injectable()
export class InscripcionTallerService {
  constructor(
    @InjectRepository(InscripcionTaller)
    private repo: Repository<InscripcionTaller>,
  ) {}

  async solicitar(dto: CreateInscripcionTallerDto): Promise<InscripcionTaller> {
    const existente = await this.repo.findOne({
      where: { alumnoId: dto.alumnoId, tallerId: dto.tallerId },
    });
    if (existente) {
      if (existente.estado === 'PENDIENTE') {
        throw new ConflictException('Ya tienes una solicitud pendiente para este taller');
      }
      if (existente.estado === 'ACEPTADO') {
        throw new ConflictException('Ya estás inscrito en este taller');
      }
      if (existente.estado === 'RECHAZADO') {
        existente.estado = 'PENDIENTE';
        return await this.repo.save(existente);
      }
    }
    const inscripcion = this.repo.create({
      alumnoId: dto.alumnoId,
      tallerId: dto.tallerId,
      estado: 'PENDIENTE',
    });
    return await this.repo.save(inscripcion);
  }

  async findByTaller(tallerId: number): Promise<InscripcionTaller[]> {
    return await this.repo.find({
      where: { tallerId },
      relations: ['alumno', 'taller'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByAlumno(alumnoId: number): Promise<InscripcionTaller[]> {
    return await this.repo.find({
      where: { alumnoId },
      relations: ['taller', 'alumno'],
      order: { createdAt: 'DESC' },
    });
  }

  async responder(
    id: number,
    dto: ResponderInscripcionTallerDto,
  ): Promise<InscripcionTaller> {
    const inscripcion = await this.repo.findOne({
      where: { id },
      relations: ['alumno', 'taller'],
    });
    if (!inscripcion) {
      throw new NotFoundException('Solicitud no encontrada');
    }
    if (inscripcion.estado !== 'PENDIENTE') {
      throw new BadRequestException('Esta solicitud ya fue respondida');
    }
    inscripcion.estado = dto.estado;
    return await this.repo.save(inscripcion);
  }
}
