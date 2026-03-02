import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Salida } from '../entities/salida.entity';
import { CreateSalidaDto } from '../dto/create-salida.dto';

@Injectable()
export class SalidaService {
  constructor(
    @InjectRepository(Salida)
    private salidaRepository: Repository<Salida>,
  ) {}

  async create(createSalidaDto: CreateSalidaDto): Promise<Salida> {
    const salida = this.salidaRepository.create({
      destino: createSalidaDto.destino,
      fecha: new Date(createSalidaDto.fecha),
      hora: createSalidaDto.hora,
      descripcion: createSalidaDto.descripcion,
      tallerId: createSalidaDto.tallerId,
      adminId: createSalidaDto.adminId,
      profesorId: createSalidaDto.profesorId,
    });

    return await this.salidaRepository.save(salida);
  }

  async findAll(): Promise<Salida[]> {
    return await this.salidaRepository.find({
      relations: ['taller', 'admin', 'profesor'],
    });
  }

  async findOne(id: number): Promise<Salida> {
    const salida = await this.salidaRepository.findOne({
      where: { id },
      relations: ['taller', 'admin', 'profesor'],
    });
    if (!salida) {
      throw new NotFoundException(`Salida con ID ${id} no encontrada`);
    }
    return salida;
  }

  async findByTaller(tallerId: number): Promise<Salida[]> {
    return await this.salidaRepository.find({
      where: { tallerId },
      relations: ['taller', 'admin', 'profesor'],
    });
  }

  async update(id: number, updateSalidaDto: Partial<CreateSalidaDto>): Promise<Salida> {
    const salida = await this.findOne(id);
    Object.assign(salida, updateSalidaDto);
    if (updateSalidaDto.fecha) {
      salida.fecha = new Date(updateSalidaDto.fecha);
    }
    return await this.salidaRepository.save(salida);
  }

  async remove(id: number): Promise<void> {
    const salida = await this.findOne(id);
    await this.salidaRepository.remove(salida);
  }
}

