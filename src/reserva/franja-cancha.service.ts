/**
 * =============================================================================
 * reserva/franja-cancha.service.ts — FRANJAS HABILITADAS POR LA DIRECTIVA
 * =============================================================================
 * Una "franja" = bloque reservable (espacio + díaSemana + horaInicio–horaFin).
 *
 * Campos importantes de FranjaCancha:
 *   - activa    → si aparece en la grilla de disponibilidad
 *   - paraTodos → franja 13:00–14:00 (siempre activa, no la apaga la directiva)
 *
 * Flujo típico:
 *   GET /franja-cancha → asegurarFranjasBase() → findAll()
 *   PUT /franja-cancha → actualizar() (activa/desactiva y puede alargar bloques)
 *
 * Si la directiva crea un bloque de 60 min, ocultarFranjasCubiertas() desactiva
 * los sub-slots de 30 min que quedan “dentro” de ese bloque.
 * =============================================================================
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// Repository.find / findOne / create / save = consultas TypeORM sobre franja_cancha.
import { Repository } from 'typeorm';
import { FranjaCancha } from '../entities/franja-cancha.entity';
import { ActualizarFranjasCanchaDto } from '../dto/actualizar-franjas-cancha.dto';
import {
  CANCHA_DURACION_SLOT_MIN,
  CANCHA_ESPACIO_DEFAULT,
  CANCHA_HORA_FIN,
  CANCHA_HORA_INICIO,
  esHorarioParaTodos,
  iterarIniciosSlotCancha,
  normalizarHora,
  sumarMinutosAHora,
} from './cancha.constants';

/** Configuración y mantenimiento de franjas reservables por espacio y día. */
@Injectable()
export class FranjaCanchaService {
  constructor(
    @InjectRepository(FranjaCancha)
    private repo: Repository<FranjaCancha>,
  ) {}

  /**
   * Todas las franjas de un espacio, ordenadas por día y hora.
   * find({ where: { espacio } }) → WHERE espacio = ?
   */
  async findAll(espacio = CANCHA_ESPACIO_DEFAULT): Promise<FranjaCancha[]> {
    return this.repo.find({
      where: { espacio },
      order: { diaSemana: 'ASC', horaInicio: 'ASC' },
    });
  }

  /**
   * Solo franjas activas de un día concreto (1=lunes … 7=domingo).
   * where combina espacio + diaSemana + activa: true.
   */
  async findActivasPorDia(diaSemana: number, espacio = CANCHA_ESPACIO_DEFAULT): Promise<FranjaCancha[]> {
    return this.repo.find({
      where: { espacio, diaSemana, activa: true },
      order: { horaInicio: 'ASC' },
    });
  }

  /**
   * Busca una franja tolerando formato time "HH:MM:00" o "HH:MM".
   * PostgreSQL/TypeORM a veces serializan distinto.
   */
  private async buscarFranja(
    espacio: string,
    diaSemana: number,
    horaInicio: string,
  ): Promise<FranjaCancha | null> {
    return (
      (await this.repo.findOne({
        where: { espacio, diaSemana, horaInicio: `${horaInicio}:00` as any },
      })) ??
      (await this.repo.findOne({
        where: { espacio, diaSemana, horaInicio },
      }))
    );
  }

  /**
   * Aplica o actualiza franjas según la directiva.
   * - Si existe: actualiza activa/horaFin (paraTodos siempre queda activa)
   * - Si no existe: la crea
   * - Si duración > 30 min: oculta los sub-slots cubiertos
   */
  async actualizar(dto: ActualizarFranjasCanchaDto): Promise<FranjaCancha[]> {
    const espacio = dto.espacio ?? CANCHA_ESPACIO_DEFAULT;

    for (const item of dto.franjas) {
      const horaInicio = normalizarHora(item.horaInicio);
      const duracion = item.duracionMinutos ?? CANCHA_DURACION_SLOT_MIN;
      const horaFin = sumarMinutosAHora(horaInicio, duracion);

      let franja = await this.buscarFranja(espacio, item.diaSemana, horaInicio);

      if (franja) {
        // Las franjas "para todos" no se pueden desactivar desde la UI de directiva
        if (franja.paraTodos) {
          franja.activa = true;
        } else {
          franja.activa = item.activa;
        }
        franja.horaFin = `${horaFin}:00`;
        await this.repo.save(franja);

        if (duracion > CANCHA_DURACION_SLOT_MIN && franja.activa) {
          await this.ocultarFranjasCubiertas(espacio, item.diaSemana, horaInicio, duracion);
        }
      } else {
        const esParaTodos = esHorarioParaTodos(horaInicio) && duracion === CANCHA_DURACION_SLOT_MIN;
        await this.repo.save(
          this.repo.create({
            espacio,
            diaSemana: item.diaSemana,
            horaInicio: `${horaInicio}:00`,
            horaFin: `${horaFin}:00`,
            activa: esParaTodos ? true : item.activa,
            paraTodos: esParaTodos,
          }),
        );
        if (duracion > CANCHA_DURACION_SLOT_MIN && item.activa) {
          await this.ocultarFranjasCubiertas(espacio, item.diaSemana, horaInicio, duracion);
        }
      }
    }

    return this.findAll(espacio);
  }

  /**
   * Desactiva franjas de 30 min que quedan cubiertas por un bloque más largo.
   * Ej.: bloque 10:00–11:00 → desactiva 10:30 (el de 10:00 es el “padre”).
   */
  private async ocultarFranjasCubiertas(
    espacio: string,
    diaSemana: number,
    horaInicio: string,
    duracion: number,
  ): Promise<void> {
    const pasos = duracion / CANCHA_DURACION_SLOT_MIN;
    for (let i = 1; i < pasos; i++) {
      const cubiertaInicio = sumarMinutosAHora(horaInicio, i * CANCHA_DURACION_SLOT_MIN);
      const cubierta = await this.buscarFranja(espacio, diaSemana, cubiertaInicio);
      if (cubierta && !cubierta.paraTodos) {
        cubierta.activa = false;
        cubierta.horaFin = `${sumarMinutosAHora(cubiertaInicio, CANCHA_DURACION_SLOT_MIN)}:00`;
        await this.repo.save(cubierta);
      }
    }
  }

  /** Detecta grillas antiguas de 1 hora (sin slots :30) que hay que migrar. */
  private necesitaMigracionMediaHora(franjas: FranjaCancha[]): boolean {
    if (franjas.length === 0) return false;
    return !franjas.some((f) => normalizarHora(f.horaInicio).endsWith(':30'));
  }

  /** Borra franjas del espacio y recrea la grilla de 30 min preservando activas. */
  private async migrarFranjasMediaHora(
    espacio: string,
    existentes: FranjaCancha[],
  ): Promise<void> {
    const mapa = new Map<string, FranjaCancha>();
    for (const f of existentes) {
      mapa.set(`${f.diaSemana}|${normalizarHora(f.horaInicio)}`, f);
    }

    await this.repo.delete({ espacio });
    await this.crearFranjasBase30Min(espacio, mapa);
  }

  /**
   * Crea la grilla completa: 7 días × slots de 30 min entre apertura y cierre.
   * Si hay mapaAnterior, hereda el flag `activa` del slot o de su “padre” :00.
   */
  private async crearFranjasBase30Min(
    espacio: string,
    mapaAnterior = new Map<string, FranjaCancha>(),
  ): Promise<void> {
    const filas: Partial<FranjaCancha>[] = [];

    for (let dia = 1; dia <= 7; dia++) {
      for (const horaInicio of iterarIniciosSlotCancha()) {
        const anterior = mapaAnterior.get(`${dia}|${horaInicio}`);
        const horaPadre = `${horaInicio.split(':')[0]}:00`;
        const padre = mapaAnterior.get(`${dia}|${horaPadre}`);
        const paraTodos = esHorarioParaTodos(horaInicio);
        const activa = paraTodos ? true : (anterior?.activa ?? padre?.activa ?? true);

        filas.push({
          espacio,
          diaSemana: dia,
          horaInicio: `${horaInicio}:00`,
          horaFin: `${sumarMinutosAHora(horaInicio, CANCHA_DURACION_SLOT_MIN)}:00`,
          activa,
          paraTodos,
        });
      }
    }

    await this.repo.save(filas.map((f) => this.repo.create(f)));
  }

  /**
   * Crea o migra la grilla base de franjas de 30 min y aplica reglas globales:
   *   - Desactiva slots fuera de 09:00–20:00
   *   - Marca 13:00–14:00 como paraTodos + activa
   */
  async asegurarFranjasBase(espacio = CANCHA_ESPACIO_DEFAULT): Promise<void> {
    const existentes = await this.findAll(espacio);

    if (this.necesitaMigracionMediaHora(existentes)) {
      await this.migrarFranjasMediaHora(espacio, existentes);
      return;
    }

    if (existentes.length === 0) {
      await this.crearFranjasBase30Min(espacio);
      return;
    }

    // Desactiva franjas cuyo inicio está fuera del rango de apertura/cierre
    await this.repo
      .createQueryBuilder()
      .update(FranjaCancha)
      .set({ activa: false })
      .where('espacio = :espacio', { espacio })
      .andWhere(
        '(EXTRACT(HOUR FROM hora_inicio) * 60 + EXTRACT(MINUTE FROM hora_inicio) < :inicio OR EXTRACT(HOUR FROM hora_inicio) * 60 + EXTRACT(MINUTE FROM hora_inicio) >= :fin)',
        { inicio: CANCHA_HORA_INICIO * 60, fin: CANCHA_HORA_FIN * 60 },
      )
      .execute();

    // Fuerza la regla de “horario para todos” (13:00–14:00)
    await this.repo
      .createQueryBuilder()
      .update(FranjaCancha)
      .set({ paraTodos: true, activa: true })
      .where('espacio = :espacio', { espacio })
      .andWhere(
        'EXTRACT(HOUR FROM hora_inicio) * 60 + EXTRACT(MINUTE FROM hora_inicio) >= :ini AND EXTRACT(HOUR FROM hora_inicio) * 60 + EXTRACT(MINUTE FROM hora_inicio) < :fin',
        { ini: 13 * 60, fin: 14 * 60 },
      )
      .execute();
  }
}
