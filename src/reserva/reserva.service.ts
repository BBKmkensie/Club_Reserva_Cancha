import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reserva } from '../entities/reserva.entity';
import { CreateReservaDto } from '../dto/create-reserva.dto';

@Injectable()
export class ReservaService {
  constructor(
    @InjectRepository(Reserva)
    private reservaRepository: Repository<Reserva>,
  ) {}

  async create(createReservaDto: CreateReservaDto): Promise<Reserva> {
    const reserva = this.reservaRepository.create({
      espacio: createReservaDto.espacio,
      fecha: new Date(createReservaDto.fecha),
      horaInicio: createReservaDto.horaInicio,
      horaFin: createReservaDto.horaFin,
      tallerId: createReservaDto.tallerId,
      adminId: createReservaDto.adminId ?? null,
      profesorId: createReservaDto.profesorId ?? null,
    });

    return await this.reservaRepository.save(reserva);
  }

  async findAll(): Promise<Reserva[]> {
    return await this.reservaRepository.find({
      relations: ['taller', 'admin', 'profesor'],
    });
  }

  async findOne(id: number): Promise<Reserva> {
    const reserva = await this.reservaRepository.findOne({
      where: { id },
      relations: ['taller', 'admin', 'profesor'],
    });
    if (!reserva) {
      throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
    }
    return reserva;
  }

  async findByTaller(tallerId: number): Promise<Reserva[]> {
    return await this.reservaRepository.find({
      where: { tallerId },
      relations: ['taller', 'admin', 'profesor'],
    });
  }

  async findByFecha(fecha: string): Promise<Reserva[]> {
    return await this.reservaRepository.find({
      where: { fecha: new Date(fecha) },
      relations: ['taller', 'admin', 'profesor'],
    });
  }

  async update(id: number, updateReservaDto: Partial<CreateReservaDto>): Promise<Reserva> {
    const reserva = await this.findOne(id);
    Object.assign(reserva, updateReservaDto);
    if (updateReservaDto.fecha) {
      reserva.fecha = new Date(updateReservaDto.fecha);
    }
    return await this.reservaRepository.save(reserva);
  }

  async remove(id: number): Promise<void> {
    const reserva = await this.findOne(id);
    await this.reservaRepository.remove(reserva);
  }
}

