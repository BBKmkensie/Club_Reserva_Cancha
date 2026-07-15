/**
 * =============================================================================
 * reserva/reserva.service.ts — LÓGICA DE NEGOCIO DE RESERVAS DE CANCHA
 * =============================================================================
 * Responsabilidades:
 *   1. Calcular disponibilidad diaria/semanal (slots vs reservas)
 *   2. Validar nuevas reservas (duración, rango, franja activa, solapes)
 *   3. CRUD de la entidad Reserva
 *
 * Estados de un slot:
 *   - 'disponible'   → franja activa sin reserva
 *   - 'ocupada'      → hay una reserva que solapa ese horario
 *   - 'no_habilitada'→ (conceptualmente) franja inactiva; aquí no se listan
 *
 * Concurrencia:
 *   - validarReserva() rechaza solapes detectados antes del INSERT
 *   - Índice único (espacio, fecha, hora_inicio) + EXCLUDE gist de rangos en BD
 *     → si dos usuarios confirman a la vez, la segunda falla (23505 / 23P01)
 * =============================================================================
 */
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
// @InjectRepository = pide el Repository de una entidad registrada en ReservaModule.
import { InjectRepository } from '@nestjs/typeorm';
// Repository: find / findOne / create / save / remove — API TypeORM sobre la tabla.
import { DataSource, Repository } from 'typeorm';
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

/** Posibles estados visuales de un bloque horario en la grilla. */
export type EstadoSlotCancha = 'disponible' | 'ocupada' | 'no_habilitada';

/** Representación de un bloque horario con su estado de ocupación (respuesta API). */
export interface SlotDisponibilidadCancha {
  horaInicio: string;
  horaFin: string;
  espacio: string;
  estado: EstadoSlotCancha;
  duracionMinutos: number;
  /** true si es la franja 13:00–14:00 abierta a todos los talleres */
  paraTodos: boolean;
  reservaId?: number;
  tallerId?: number;
  tallerNombre?: string;
  profesorNombre?: string;
}

/** @Injectable() = Nest puede inyectar este service en el controller y otros módulos. */
@Injectable()
export class ReservaService implements OnModuleInit {
  private readonly logger = new Logger(ReservaService.name);

  constructor(
    @InjectRepository(Reserva)
    private reservaRepository: Repository<Reserva>,
    @InjectRepository(FranjaCancha)
    private franjaRepository: Repository<FranjaCancha>,
    private franjaCanchaService: FranjaCanchaService,
    private dataSource: DataSource,
  ) {}

  /**
   * Refuerza en Postgres que no existan dos reservas solapadas
   * (protege carreras entre dos clics simultáneos).
   */
  async onModuleInit(): Promise<void> {
    try {
      await this.dataSource.query(`CREATE EXTENSION IF NOT EXISTS btree_gist`);

      await this.dataSource.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS UQ_reservas_espacio_fecha_hora_inicio
        ON reservas (espacio, fecha, hora_inicio)
      `);

      await this.dataSource.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'reservas_no_solape_espacio_fecha'
          ) THEN
            ALTER TABLE reservas
            ADD CONSTRAINT reservas_no_solape_espacio_fecha
            EXCLUDE USING gist (
              espacio WITH =,
              fecha WITH =,
              tsrange(
                (fecha + hora_inicio),
                (fecha + hora_fin),
                '[)'
              ) WITH &&
            );
          END IF;
        END $$;
      `);
      this.logger.log('Restricciones de no-solape de cancha aseguradas en BD');
    } catch (err: any) {
      this.logger.warn(
        `No se pudieron asegurar restricciones de no-solape en reservas: ${err?.message ?? err}`,
      );
    }
  }

  /** Interpreta errores de unicidad / exclusión de Postgres como conflicto de negocio. */
  private lanzarSiConflictoCancha(err: any, horaInicio: string, horaFin: string): void {
    const code = err?.code ?? err?.driverError?.code;
    if (code === '23505' || code === '23P01') {
      throw new ConflictException(
        `La cancha ya está ocupada de ${horaInicio} a ${horaFin} en esa fecha`,
      );
    }
  }
  /**
   * Slots de un día: cruza franjas activas con reservas existentes.
   * 1) Asegura grilla base de franjas
   * 2) find({ where }) carga franjas del día + reservas de esa fecha
   * 3) Por cada franja activa, busca si hay reserva que solape → ocupada/disponible
   */
  async obtenerDisponibilidad(
    fecha: string,
    espacio = CANCHA_ESPACIO_DEFAULT,
  ): Promise<SlotDisponibilidadCancha[]> {
    await this.franjaCanchaService.asegurarFranjasBase(espacio);

    const diaSemana = diaSemanaDesdeFecha(fecha);
    // find({ where, order }) → SELECT … WHERE espacio=? AND dia_semana=? ORDER BY …
    const franjas = await this.franjaRepository.find({
      where: { espacio, diaSemana },
      order: { horaInicio: 'ASC' },
    });

    // relations: trae taller y profesor (JOIN) para mostrar nombres en la grilla
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

      // ¿Alguna reserva existente solapa este intervalo?
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

  /** Disponibilidad de los siete días a partir del lunes de la semana indicada. */
  async obtenerDisponibilidadSemana(
    fechaInicio?: string,
    espacio = CANCHA_ESPACIO_DEFAULT,
  ): Promise<{ fecha: string; diaSemana: number; slots: SlotDisponibilidadCancha[] }[]> {
    const lunes = lunesDeSemana(fechaInicio);
    const dias: { fecha: string; diaSemana: number; slots: SlotDisponibilidadCancha[] }[] = [];
    // i=0 lunes … i=6 domingo
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

  /**
   * Valida duración, rango horario, franja habilitada y ausencia de solapamientos.
   * @param excluirReservaId — al actualizar, ignoramos la propia reserva en el check de solape
   */
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

    // Las reservas solo en múltiplos de 30 min
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
    // PostgreSQL time a veces guarda "09:00:00" y a veces "09:00" → probamos ambos
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

    // Debe reservar exactamente la duración del bloque que definió la directiva
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

    // QueryBuilder: busca reservas del mismo espacio/fecha cuyo intervalo se solape
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

  /** Crea una reserva tras validar; captura violación de unique/EXCLUDE (carrera). */
  async create(createReservaDto: CreateReservaDto): Promise<Reserva> {
    await this.validarReserva(createReservaDto);

    const horaInicio = normalizarHora(createReservaDto.horaInicio);
    const horaFin = normalizarHora(createReservaDto.horaFin);

    // create() arma la entidad en memoria; save() hace el INSERT
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
      this.lanzarSiConflictoCancha(err, horaInicio, horaFin);
      throw err;
    }
  }

  /** Lista todas las reservas con relaciones taller/admin/profesor. */
  async findAll(): Promise<Reserva[]> {
    return await this.reservaRepository.find({
      relations: ['taller', 'admin', 'profesor'],
      order: { fecha: 'DESC', horaInicio: 'ASC' },
    });
  }

  /** Busca por id o lanza NotFoundException (404). */
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

  /** Filtra reservas pertenecientes a un taller. */
  async findByTaller(tallerId: number): Promise<Reserva[]> {
    return await this.reservaRepository.find({
      where: { tallerId },
      relations: ['taller', 'admin', 'profesor'],
      order: { fecha: 'DESC', horaInicio: 'ASC' },
    });
  }

  /** Filtra reservas de una fecha concreta. */
  async findByFecha(fecha: string): Promise<Reserva[]> {
    return await this.reservaRepository.find({
      where: { fecha: fechaLocal(fecha) as any },
      relations: ['taller', 'admin', 'profesor'],
      order: { horaInicio: 'ASC' },
    });
  }

  /**
   * Actualiza una reserva: fusiona campos actuales + DTO parcial,
   * revalida (excluyendo el propio id) y guarda.
   */
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

    try {
      return await this.reservaRepository.save(reserva);
    } catch (err: any) {
      this.lanzarSiConflictoCancha(
        err,
        normalizarHora(merged.horaInicio),
        normalizarHora(merged.horaFin),
      );
      throw err;
    }
  }

  /** Elimina la reserva de la base de datos. */
  async remove(id: number): Promise<void> {
    const reserva = await this.findOne(id);
    await this.reservaRepository.remove(reserva);
  }
}
