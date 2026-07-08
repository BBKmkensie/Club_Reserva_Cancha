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
  CANCHA_DURACION_SLOT_MIN,
  CANCHA_ESPACIO_DEFAULT,
  CANCHA_HORA_FIN,
  CANCHA_HORA_INICIO,
  diaSemanaDesdeFecha,
  formatHoraSlot,
  horaAMinutos,
  horariosSolapan,
  lunesDeSemana,
  normalizarHora,
  parseFechaIso,
  fechaLocal,
  sumarDias,
} from './cancha.constants';

export type EstadoSlotCancha = 'disponible' | 'ocupada' | 'no_habilitada';

export interface SlotDisponibilidadCancha {
  horaInicio: string;
  horaFin: string;
  espacio: string;
  estado: EstadoSlotCancha;
  duracionMinutos: number;
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
      where: { espacio, fecha: fechaLocal(fecha) as any },
      relations: ['taller', 'profesor'],
    });

    const franjasActivas = franjas.filter((f) => f.activa);
    const slots: SlotDisponibilidadCancha[] = [];

    for (const franja of franjasActivas) {
      const horaInicio = normalizarHora(franja.horaInicio);
      const horaFin = normalizarHora(franja.horaFin);
      const duracionMinutos = Math.max(
        CANCHA_DURACION_SLOT_MIN,
        horaAMinutos(horaFin) - horaAMinutos(horaInicio),
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
          duracionMinutos,
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
          duracionMinutos,
          paraTodos: franja.paraTodos,
        });
      }
    }

    return slots;
  }

  async obtenerDisponibilidadSemana(
    fechaInicio?: string,
    espacio = CANCHA_ESPACIO_DEFAULT,
  ): Promise<{ fecha: string; diaSemana: number; slots: SlotDisponibilidadCancha[] }[]> {
    const lunes = lunesDeSemana(fechaInicio);
    const dias: { fecha: string; diaSemana: number; slots: SlotDisponibilidadCancha[] }[] = [];
    for (let i = 0; i < 7; i++) {
      const fecha = sumarDias(lunes, i);
      dias.push({
        fecha,
        diaSemana: diaSemanaDesdeFecha(fecha),
        slots: await this.obtenerDisponibilidad(fecha, espacio),
      });
    }
    return dias;
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

    const inicioMin = horaAMinutos(horaInicio);
    const finMin = horaAMinutos(horaFin);
    const duracionReserva = finMin - inicioMin;

    if (duracionReserva < CANCHA_DURACION_SLOT_MIN) {
      throw new BadRequestException('La hora de fin debe ser posterior a la de inicio');
    }

    if (duracionReserva % CANCHA_DURACION_SLOT_MIN !== 0) {
      throw new BadRequestException(
        `Las reservas deben ser en bloques de ${CANCHA_DURACION_SLOT_MIN} minutos`,
      );
    }

    if (inicioMin < CANCHA_HORA_INICIO * 60 || finMin > CANCHA_HORA_FIN * 60) {
      throw new BadRequestException(
        `Horario fuera del rango permitido (${formatHoraSlot(CANCHA_HORA_INICIO)}–${formatHoraSlot(CANCHA_HORA_FIN)})`,
      );
    }

    const fechaIso = parseFechaIso(dto.fecha);
    const diaSemana = diaSemanaDesdeFecha(fechaIso);
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
    const franjaDuracion = horaAMinutos(franjaFin) - horaAMinutos(normalizarHora(franja.horaInicio));

    if (duracionReserva !== franjaDuracion) {
      const etiquetaDuracion =
        franjaDuracion % 60 === 0
          ? `${franjaDuracion / 60} h`
          : `${franjaDuracion} min`;
      throw new BadRequestException(
        `Esta franja es de ${etiquetaDuracion} (${normalizarHora(franja.horaInicio)}–${franjaFin}). ` +
          (franjaDuracion === CANCHA_DURACION_SLOT_MIN
            ? `Las reservas son de ${CANCHA_DURACION_SLOT_MIN} minutos; la directiva puede ampliar franjas específicas.`
            : 'Debe reservar el bloque completo.'),
      );
    }

    const solapadas = await this.reservaRepository
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.taller', 'taller')
      .where('r.espacio = :espacio', { espacio })
      .andWhere('r.fecha = :fecha::date', { fecha: fechaIso })
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
      fecha: fechaLocal(createReservaDto.fecha),
      horaInicio: `${horaInicio}:00`,
      horaFin: `${horaFin}:00`,
      tallerId: createReservaDto.tallerId,
      adminId: createReservaDto.adminId ?? null,
      profesorId: createReservaDto.profesorId ?? null,
    });

    try {
      return await this.reservaRepository.save(reserva);
    } catch (err: any) {
      if (err?.code === '23505') {
        throw new ConflictException(
          `La cancha ya está ocupada de ${horaInicio} a ${horaFin} en esa fecha`,
        );
      }
      throw err;
    }
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
      where: { fecha: fechaLocal(fecha) as any },
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
      merged.fecha = parseFechaIso(updateReservaDto.fecha as string);
    } else if (reserva.fecha) {
      merged.fecha = parseFechaIso(reserva.fecha);
    }

    await this.validarReserva(merged, id);

    Object.assign(reserva, {
      espacio: merged.espacio,
      fecha: fechaLocal(merged.fecha),
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
