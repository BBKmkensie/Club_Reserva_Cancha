import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FranjaCancha } from '../entities/franja-cancha.entity';
import { ActualizarFranjasCanchaDto } from '../dto/actualizar-franjas-cancha.dto';
import {
  CANCHA_ESPACIO_DEFAULT,
  CANCHA_HORA_FIN,
  CANCHA_HORA_INICIO,
  CANCHA_HORA_PARA_TODOS,
  formatHoraSlot,
  normalizarHora,
} from './cancha.constants';

@Injectable()
export class FranjaCanchaService {
  constructor(
    @InjectRepository(FranjaCancha)
    private repo: Repository<FranjaCancha>,
  ) {}

  async findAll(espacio = CANCHA_ESPACIO_DEFAULT): Promise<FranjaCancha[]> {
    return this.repo.find({
      where: { espacio },
      order: { diaSemana: 'ASC', horaInicio: 'ASC' },
    });
  }

  async findActivasPorDia(diaSemana: number, espacio = CANCHA_ESPACIO_DEFAULT): Promise<FranjaCancha[]> {
    return this.repo.find({
      where: { espacio, diaSemana, activa: true },
      order: { horaInicio: 'ASC' },
    });
  }

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

  async actualizar(dto: ActualizarFranjasCanchaDto): Promise<FranjaCancha[]> {
    const espacio = dto.espacio ?? CANCHA_ESPACIO_DEFAULT;

    for (const item of dto.franjas) {
      const horaInicio = normalizarHora(item.horaInicio);
      const horaNum = parseInt(horaInicio.split(':')[0], 10);
      const duracion = item.duracionHoras ?? 1;
      const horaFin = formatHoraSlot(horaNum + duracion);

      let franja = await this.buscarFranja(espacio, item.diaSemana, horaInicio);

      if (franja) {
        if (franja.paraTodos) {
          franja.activa = true;
        } else {
          franja.activa = item.activa;
        }
        franja.horaFin = `${horaFin}:00`;
        await this.repo.save(franja);

        if (duracion > 1 && franja.activa) {
          await this.ocultarFranjasCubiertas(espacio, item.diaSemana, horaNum, duracion);
        }
      } else {
        const esParaTodos =
          horaNum === CANCHA_HORA_PARA_TODOS && duracion === 1;
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
        if (duracion > 1 && item.activa) {
          await this.ocultarFranjasCubiertas(espacio, item.diaSemana, horaNum, duracion);
        }
      }
    }

    return this.findAll(espacio);
  }

  private async ocultarFranjasCubiertas(
    espacio: string,
    diaSemana: number,
    horaInicio: number,
    duracion: number,
  ): Promise<void> {
    for (let i = 1; i < duracion; i++) {
      const h = horaInicio + i;
      const cubierta = await this.buscarFranja(espacio, diaSemana, formatHoraSlot(h));
      if (cubierta && !cubierta.paraTodos) {
        cubierta.activa = false;
        cubierta.horaFin = `${formatHoraSlot(h + 1)}:00`;
        await this.repo.save(cubierta);
      }
    }
  }

  async asegurarFranjasBase(espacio = CANCHA_ESPACIO_DEFAULT): Promise<void> {
    const existentes = await this.findAll(espacio);
    if (existentes.length > 0) {
      await this.repo
        .createQueryBuilder()
        .update(FranjaCancha)
        .set({ paraTodos: true, activa: true })
        .where('espacio = :espacio', { espacio })
        .andWhere('EXTRACT(HOUR FROM hora_inicio) = :h', { h: CANCHA_HORA_PARA_TODOS })
        .execute();
      return;
    }

    const filas: Partial<FranjaCancha>[] = [];
    for (let dia = 1; dia <= 7; dia++) {
      for (let h = CANCHA_HORA_INICIO; h < CANCHA_HORA_FIN; h++) {
        filas.push({
          espacio,
          diaSemana: dia,
          horaInicio: `${formatHoraSlot(h)}:00`,
          horaFin: `${formatHoraSlot(h + 1)}:00`,
          activa: true,
          paraTodos: h === CANCHA_HORA_PARA_TODOS,
        });
      }
    }
    await this.repo.save(filas.map((f) => this.repo.create(f)));
  }
}
