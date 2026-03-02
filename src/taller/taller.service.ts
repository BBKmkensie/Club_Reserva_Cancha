import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Taller } from '../entities/taller.entity';
import { CreateTallerDto } from '../dto/create-taller.dto';

@Injectable()
export class TallerService {
  constructor(
    @InjectRepository(Taller)
    private tallerRepository: Repository<Taller>,
  ) {}

  async create(createTallerDto: CreateTallerDto): Promise<Taller> {
    const tallerData: Partial<Taller> = {
      tipo: createTallerDto.tipo,
      descripcion: createTallerDto.descripcion,
      capacidad: createTallerDto.capacidad || 20,
      imagenUrl: createTallerDto.imagenUrl ?? null,
      fechaInicio: createTallerDto.fechaInicio
        ? new Date(createTallerDto.fechaInicio)
        : null,
      adminId: createTallerDto.adminId,
    };

    const taller = this.tallerRepository.create(tallerData);
    return await this.tallerRepository.save(taller);
  }

  async findAll(): Promise<Taller[]> {
    // Cargar sin relaciones para evitar errores si no hay datos relacionados
    return await this.tallerRepository.find();
  }

  async findOne(id: number): Promise<Taller> {
    const taller = await this.tallerRepository.findOne({
      where: { id },
      relations: ['admin', 'alumnos', 'profesores', 'reservas', 'salidas'],
    });
    if (!taller) {
      throw new NotFoundException(`Taller con ID ${id} no encontrado`);
    }
    return taller;
  }

  async update(id: number, updateTallerDto: Partial<CreateTallerDto>): Promise<Taller> {
    const taller = await this.findOne(id);
    Object.assign(taller, updateTallerDto);
    if (updateTallerDto.fechaInicio) {
      taller.fechaInicio = new Date(updateTallerDto.fechaInicio);
    }
    return await this.tallerRepository.save(taller);
  }

  async remove(id: number): Promise<void> {
    const taller = await this.findOne(id);
    await this.tallerRepository.remove(taller);
  }
}

