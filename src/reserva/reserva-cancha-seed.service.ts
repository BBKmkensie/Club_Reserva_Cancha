/**
 * Servicio de seed para reservas deportivas semestrales en cancha.
 * Crea reservas de fútbol y vóley según horarios oficiales del periodo académico.
 */
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Taller } from '../entities/taller.entity';
import { Profesor } from '../entities/profesor.entity';
import { Reserva } from '../entities/reserva.entity';
import { PeriodoAcademico } from '../entities/periodo-academico.entity';
import { normalizarNombreTaller } from '../common/catalogo-talleres.pool';
import { horariosCanchaDeportesSemestre } from '../common/reservas-cancha-deportes.pool';
import { FranjaCanchaService } from './franja-cancha.service';
import {
  CANCHA_DURACION_SLOT_MIN,
  CANCHA_ESPACIO_DEFAULT,
  diaSemanaDesdeFecha,
  fechaLocal,
  horaAMinutos,
  normalizarHora,
  parseFechaIso,
  sumarDias,
  sumarMinutosAHora,
} from './cancha.constants';

/** Resultado del seed de reservas deportivas por taller y periodo. */
export interface SeedReservasDeportesResult {
  periodo: { inicio: string; fin: string; nombre: string };
  talleres: Array<{ tipo: string; diaSemana: number; horario: string; reservasCreadas: number; reservasOmitidas: number }>;
  totalCreadas: number;
  totalOmitidas: number;
}

/** Genera reservas de cancha para talleres deportivos durante el semestre activo. */
@Injectable()
export class ReservaCanchaSeedService {
  private readonly logger = new Logger(ReservaCanchaSeedService.name);

  constructor(
    @InjectRepository(Taller)
    private tallerRepo: Repository<Taller>,
    @InjectRepository(Profesor)
    private profesorRepo: Repository<Profesor>,
    @InjectRepository(Reserva)
    private reservaRepo: Repository<Reserva>,
    @InjectRepository(PeriodoAcademico)
    private periodoRepo: Repository<PeriodoAcademico>,
    private franjaCanchaService: FranjaCanchaService,
  ) {}

  /** Siembra reservas de fútbol y vóley en el espacio indicado (por defecto cancha principal). */
  async seedReservasDeportesSemestre(
    espacio = CANCHA_ESPACIO_DEFAULT,
  ): Promise<SeedReservasDeportesResult> {
    await this.franjaCanchaService.asegurarFranjasBase(espacio);

    const periodo = await this.resolverPeriodo();
    const inicio = parseFechaIso(periodo.fechaApertura);
    const fin = parseFechaIso(periodo.fechaCierre);

    const talleresDb = await this.tallerRepo.find({ relations: ['profesores'] });
    const porNombre = new Map<string, Taller>();
    for (const t of talleresDb) {
      porNombre.set(normalizarNombreTaller(t.tipo), t);
      for (const alias of this.aliasDe(t.tipo)) {
        porNombre.set(alias, t);
      }
    }

    const result: SeedReservasDeportesResult = {
      periodo: {
        inicio,
        fin,
        nombre: periodo.nombre,
      },
      talleres: [],
      totalCreadas: 0,
      totalOmitidas: 0,
    };

    for (const item of horariosCanchaDeportesSemestre()) {
      const claves = [
        normalizarNombreTaller(item.tipo),
        ...(item.alias ?? []).map(normalizarNombreTaller),
      ];
      const taller = claves.map((k) => porNombre.get(k)).find(Boolean);

      if (!taller) {
        this.logger.warn(`Taller no encontrado para reservas de cancha: ${item.tipo}`);
        continue;
      }

      const profesor =
        taller.profesores?.[0] ??
        (await this.profesorRepo.findOne({ where: { tallerId: taller.id } }));

      for (const bloque of item.bloques) {
        const slots = this.slotsDesdeBloque(bloque.horaInicio, bloque.horaFin);
        let creadas = 0;
        let omitidas = 0;

        for (const fecha of this.iterarFechas(inicio, fin)) {
          if (diaSemanaDesdeFecha(fecha) !== bloque.diaSemana) continue;

          for (const slot of slots) {
            const existe = await this.reservaRepo.findOne({
              where: {
                espacio,
                fecha: fechaLocal(fecha) as any,
                horaInicio: `${slot.inicio}:00` as any,
              },
            });

            if (existe) {
              omitidas++;
              continue;
            }

            await this.reservaRepo.save(
              this.reservaRepo.create({
                espacio,
                fecha: fechaLocal(fecha),
                horaInicio: `${slot.inicio}:00`,
                horaFin: `${slot.fin}:00`,
                tallerId: taller.id,
                profesorId: profesor?.id ?? null,
                adminId: null,
              }),
            );
            creadas++;
          }
        }

        result.talleres.push({
          tipo: taller.tipo,
          diaSemana: bloque.diaSemana,
          horario: `${bloque.horaInicio}–${bloque.horaFin}`,
          reservasCreadas: creadas,
          reservasOmitidas: omitidas,
        });
        result.totalCreadas += creadas;
        result.totalOmitidas += omitidas;
      }
    }

    return result;
  }

  private async resolverPeriodo(): Promise<PeriodoAcademico> {
    const activo = await this.periodoRepo.findOne({
      where: { activo: true },
      order: { id: 'DESC' },
    });
    if (activo) return activo;

    const year = new Date().getFullYear();
    return this.periodoRepo.create({
      nombre: `Semestre ${year} (automático)`,
      fechaApertura: new Date(`${year}-03-01T12:00:00`),
      fechaCierre: new Date(`${year}-12-20T12:00:00`),
      activo: false,
    });
  }

  private iterarFechas(inicio: string, fin: string): string[] {
    const fechas: string[] = [];
    let cur = inicio;
    while (cur <= fin) {
      fechas.push(cur);
      cur = sumarDias(cur, 1);
    }
    return fechas;
  }

  private slotsDesdeBloque(
    horaInicio: string,
    horaFin: string,
  ): { inicio: string; fin: string }[] {
    const slots: { inicio: string; fin: string }[] = [];
    let cur = normalizarHora(horaInicio);
    const finMin = horaAMinutos(horaFin);

    while (horaAMinutos(cur) < finMin) {
      const slotFin = sumarMinutosAHora(cur, CANCHA_DURACION_SLOT_MIN);
      if (horaAMinutos(slotFin) > finMin) break;
      slots.push({ inicio: cur, fin: slotFin });
      cur = slotFin;
    }

    return slots;
  }

  private aliasDe(tipo: string): string[] {
    const n = normalizarNombreTaller(tipo);
    const map: Record<string, string[]> = {
      futbol: ['futsal'],
      voley: ['voleibol'],
    };
    return map[n] ?? [];
  }
}
