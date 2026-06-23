import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reserva } from '../entities/reserva.entity';
import { FranjaCancha } from '../entities/franja-cancha.entity';
import { CreateReservaDto } from '../dto/create-reserva.dto';
import { FranjaCanchaService } from './franja-cancha.service';
import {
  CANCHA_ESPACIO_DEFAULT,
  CANCHA_HORA_FIN,
  CANCHA_HORA_INICIO,
  diaSemanaDesdeFecha,
  formatHoraSlot,
  horaAMinutos,
  horariosSolapan,
  normalizarHora,
} from './cancha.constants';

export type EstadoSlotCancha = 'disponible' | 'ocupada' | 'no_habilitada';

export interface SlotDisponibilidadCancha {
  horaInicio: string;
  horaFin: string;
  espacio: string;
  estado: EstadoSlotCancha;
  duracionHoras: number;
  paraTodos: boolean;
  reservaId?: number;
  tallerId?: number;
  tallerNombre?: string;
  profesorNombre?: string;
}

@Injectable()
export class ReservaService {
  constructor(
    @InjectRepository(Reserva)
    private reservaRepository: Repository<Reserva>,
    @InjectRepository(FranjaCancha)
    private franjaRepository: Repository<FranjaCancha>,
    private franjaCanchaService: FranjaCanchaService,
  ) {}

  async obtenerDisponibilidad(
    fecha: string,
    espacio = CANCHA_ESPACIO_DEFAULT,
  ): Promise<SlotDisponibilidadCancha[]> {
    await this.franjaCanchaService.asegurarFranjasBase(espacio);

    const diaSemana = diaSemanaDesdeFecha(fecha);
    const franjas = await this.franjaRepository.find({
      where: { espacio, diaSemana },
      order: { horaInicio: 'ASC' },
    });

    const reservas = await this.reservaRepository.find({
      where: { espacio, fecha: new Date(fecha) as any },
      relations: ['taller', 'profesor'],
    });

    const franjasActivas = franjas.filter((f) => f.activa);
    const slots: SlotDisponibilidadCancha[] = [];

    for (const franja of franjasActivas) {
      const horaInicio = normalizarHora(franja.horaInicio);
      const horaFin = normalizarHora(franja.horaFin);
      const duracionHoras = Math.max(
        1,
        Math.round((horaAMinutos(horaFin) - horaAMinutos(horaInicio)) / 60),
      );

      const reserva = reservas.find((r) =>
        horariosSolapan(
          horaInicio,
          horaFin,
          normalizarHora(r.horaInicio),
          normalizarHora(r.horaFin),
        ),
      );

      if (reserva) {
        slots.push({
          horaInicio,
          horaFin,
          espacio,
          estado: 'ocupada',
          duracionHoras,
          paraTodos: franja.paraTodos,
          reservaId: reserva.id,
          tallerId: reserva.tallerId,
          tallerNombre: reserva.taller?.tipo,
          profesorNombre: reserva.profesor?.nombre,
        });
      } else {
        slots.push({
          horaInicio,
          horaFin,
          espacio,
          estado: 'disponible',
          duracionHoras,
          paraTodos: franja.paraTodos,
        });
      }
    }

    return slots;
  }

  private async validarReserva(
    dto: CreateReservaDto,
    excluirReservaId?: number,
  ): Promise<void> {
    const espacio = dto.espacio || CANCHA_ESPACIO_DEFAULT;
    const horaInicio = normalizarHora(dto.horaInicio);
    const horaFin = normalizarHora(dto.horaFin);

    if (!horaInicio || !horaFin) {
      throw new BadRequestException('Debe indicar hora de inicio y fin');
    }

    const inicioNum = parseInt(horaInicio.split(':')[0], 10);
    const finNum = parseInt(horaFin.split(':')[0], 10);
    const duracionReserva = finNum - inicioNum;

    if (duracionReserva < 1) {
      throw new BadRequestException('La hora de fin debe ser posterior a la de inicio');
    }

    if (inicioNum < CANCHA_HORA_INICIO || finNum > CANCHA_HORA_FIN) {
      throw new BadRequestException(
        `Horario fuera del rango permitido (${formatHoraSlot(CANCHA_HORA_INICIO)}–${formatHoraSlot(CANCHA_HORA_FIN)})`,
      );
    }

    const diaSemana = diaSemanaDesdeFecha(dto.fecha);
    const franja =
      (await this.franjaRepository.findOne({
        where: { espacio, diaSemana, horaInicio: `${horaInicio}:00` as any },
      })) ??
      (await this.franjaRepository.findOne({
        where: { espacio, diaSemana, horaInicio },
      }));

    if (!franja?.activa) {
      throw new BadRequestException(
        'Este horario no está habilitado por la directiva para reservas',
      );
    }

    const franjaFin = normalizarHora(franja.horaFin);
    const franjaDuracion =
      (horaAMinutos(franjaFin) - horaAMinutos(normalizarHora(franja.horaInicio))) / 60;

    if (duracionReserva !== franjaDuracion) {
      throw new BadRequestException(
        `Esta franja es de ${franjaDuracion} h (${normalizarHora(franja.horaInicio)}–${franjaFin}). ` +
          (franjaDuracion === 1
            ? 'Las reservas son de 1 hora; la directiva puede ampliar franjas específicas.'
            : 'Debe reservar el bloque completo.'),
      );
    }

    const solapadas = await this.reservaRepository
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.taller', 'taller')
      .where('r.espacio = :espacio', { espacio })
      .andWhere('r.fecha = :fecha', { fecha: dto.fecha })
      .andWhere('r.hora_inicio < :fin::time', { fin: `${horaFin}:00` })
      .andWhere('r.hora_fin > :inicio::time', { inicio: `${horaInicio}:00` })
      .getMany();

    const existente = solapadas.find((r) => r.id !== excluirReservaId);

    if (existente) {
      throw new ConflictException(
        `La cancha ya está ocupada de ${horaInicio} a ${horaFin}` +
          (existente.taller?.tipo ? ` (conflicto con "${existente.taller.tipo}")` : ''),
      );
    }
  }

  async create(createReservaDto: CreateReservaDto): Promise<Reserva> {
    await this.validarReserva(createReservaDto);

    const horaInicio = normalizarHora(createReservaDto.horaInicio);
    const horaFin = normalizarHora(createReservaDto.horaFin);

    const reserva = this.reservaRepository.create({
      espacio: createReservaDto.espacio || CANCHA_ESPACIO_DEFAULT,
      fecha: new Date(createReservaDto.fecha),
      horaInicio: `${horaInicio}:00`,
      horaFin: `${horaFin}:00`,
      tallerId: createReservaDto.tallerId,
      adminId: createReservaDto.adminId ?? null,
      profesorId: createReservaDto.profesorId ?? null,
    });

    return await this.reservaRepository.save(reserva);
  }

  async findAll(): Promise<Reserva[]> {
    return await this.reservaRepository.find({
      relations: ['taller', 'admin', 'profesor'],
      order: { fecha: 'DESC', horaInicio: 'ASC' },
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
      order: { fecha: 'DESC', horaInicio: 'ASC' },
    });
  }

  async findByFecha(fecha: string): Promise<Reserva[]> {
    return await this.reservaRepository.find({
      where: { fecha: new Date(fecha) as any },
      relations: ['taller', 'admin', 'profesor'],
      order: { horaInicio: 'ASC' },
    });
  }

  async update(id: number, updateReservaDto: Partial<CreateReservaDto>): Promise<Reserva> {
    const reserva = await this.findOne(id);
    const merged: CreateReservaDto = {
      espacio: updateReservaDto.espacio ?? reserva.espacio,
      fecha: updateReservaDto.fecha ?? (reserva.fecha as any),
      horaInicio: updateReservaDto.horaInicio ?? reserva.horaInicio,
      horaFin: updateReservaDto.horaFin ?? reserva.horaFin,
      tallerId: updateReservaDto.tallerId ?? reserva.tallerId,
      adminId: updateReservaDto.adminId ?? reserva.adminId ?? undefined,
      profesorId: updateReservaDto.profesorId ?? reserva.profesorId ?? undefined,
    };

    if (updateReservaDto.fecha) {
      merged.fecha =
        typeof updateReservaDto.fecha === 'string'
          ? updateReservaDto.fecha
          : new Date(updateReservaDto.fecha).toISOString().split('T')[0];
    } else if (reserva.fecha) {
      merged.fecha = new Date(reserva.fecha).toISOString().split('T')[0];
    }

    await this.validarReserva(merged, id);

    Object.assign(reserva, {
      espacio: merged.espacio,
      fecha: new Date(merged.fecha),
      horaInicio: `${normalizarHora(merged.horaInicio)}:00`,
      horaFin: `${normalizarHora(merged.horaFin)}:00`,
      tallerId: merged.tallerId,
      adminId: merged.adminId ?? null,
      profesorId: merged.profesorId ?? null,
    });

    return await this.reservaRepository.save(reserva);
  }

  async remove(id: number): Promise<void> {
    const reserva = await this.findOne(id);
    await this.reservaRepository.remove(reserva);
  }
}
