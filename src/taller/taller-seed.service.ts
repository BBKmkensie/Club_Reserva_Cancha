/**
 * =============================================================================
 * taller/taller-seed.service.ts — CARGA INICIAL DE TALLERES / HORARIOS
 * =============================================================================
 * NO es un endpoint HTTP. Lo usan scripts npm, por ejemplo:
 *   npm run seed:catalogo-talleres
 *   npm run seed:horarios-talleres
 *
 * Lee datos de:
 *   common/catalogo-talleres.pool.ts   → lista oficial de talleres
 *   common/horarios-oficiales.pool.ts  → bloques día/hora por taller
 *
 * Y los inserta/actualiza en PostgreSQL (talleres, profesores, taller_horario).
 * =============================================================================
 */
// Injectable = Nest puede inyectar este service; InjectRepository = repositorio TypeORM.
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// Repository.find / save = consultas e inserts TypeORM sobre la tabla.
import { Repository } from 'typeorm';
import { Taller } from '../entities/taller.entity';
import { Profesor } from '../entities/profesor.entity';
import { TallerHorario } from '../entities/taller-horario.entity';
import {
  CATALOGO_TALLERES_SEED,
  normalizarNombreTaller,
  TallerCatalogoSeed,
} from '../common/catalogo-talleres.pool';
import { HORARIOS_OFICIALES_TALLERES } from '../common/horarios-oficiales.pool';
import { hashPassword } from '../common/password.util';

/** Contadores que devuelve el seed del catálogo. */
export interface SeedCatalogoTalleresResult {
  creados: number;
  actualizados: number;
  profesoresAsignados: number;
  profesoresCreados: number;
  detalle: Array<{
    tipo: string;
    accion: 'creado' | 'actualizado';
    profesor?: string;
  }>;
}

/** Contadores que devuelve el seed de horarios oficiales. */
export interface SeedHorariosOficialesResult {
  actualizados: string[];
  bloquesCargados: number;
  noEncontrados: string[];
}

/** @Injectable() = lo registra Nest como provider (lo usan scripts npm de seed). */
@Injectable()
export class TallerSeedService {
  constructor(
    @InjectRepository(Taller)
    private tallerRepo: Repository<Taller>,
    @InjectRepository(Profesor)
    private profesorRepo: Repository<Profesor>,
    @InjectRepository(TallerHorario)
    private horarioRepo: Repository<TallerHorario>,
  ) {}

  /**
   * Inserta/actualiza el catálogo oficial de talleres y asigna profesores.
   * Fuente: CATALOGO_TALLERES_SEED. find() carga existentes; save() crea o actualiza.
   */
  async seedCatalogoTalleres(): Promise<SeedCatalogoTalleresResult> {
    // find() sin where → SELECT * (con relación profesores)
    const existentes = await this.tallerRepo.find({ relations: ['profesores'] });
    const porNombre = new Map<string, Taller>();
    for (const t of existentes) {
      porNombre.set(normalizarNombreTaller(t.tipo), t);
      for (const alias of this.aliasDe(t.tipo)) {
        porNombre.set(alias, t);
      }
    }

    const profesoresLibres = await this.profesorRepo.find({
      where: {},
      order: { id: 'ASC' },
    });
    const sinTaller = profesoresLibres.filter((p) => p.tallerId == null);

    const result: SeedCatalogoTalleresResult = {
      creados: 0,
      actualizados: 0,
      profesoresAsignados: 0,
      profesoresCreados: 0,
      detalle: [],
    };

    const { hash, salt } = hashPassword('12345');

    for (const item of CATALOGO_TALLERES_SEED) {
      const claves = [
        normalizarNombreTaller(item.tipo),
        ...(item.alias ?? []).map(normalizarNombreTaller),
      ];
      let taller = claves.map((k) => porNombre.get(k)).find(Boolean);

      if (!taller) {
        taller = this.tallerRepo.create({
          tipo: item.tipo,
          descripcion: item.descripcion,
          imagenUrl: item.imagenUrl,
          capacidad: 20,
          estado: 'PUBLICADO',
          adminId: 1,
          publicadoAt: new Date(),
        });
        taller = await this.tallerRepo.save(taller);
        porNombre.set(normalizarNombreTaller(taller.tipo), taller);
        result.creados++;
        result.detalle.push({ tipo: item.tipo, accion: 'creado' });
      } else {
        taller.descripcion = item.descripcion;
        taller.imagenUrl = item.imagenUrl;
        if (taller.estado === 'BORRADOR') {
          taller.estado = 'PUBLICADO';
          taller.publicadoAt = taller.publicadoAt ?? new Date();
          taller.adminId = taller.adminId ?? 1;
        }
        await this.tallerRepo.save(taller);
        result.actualizados++;
        result.detalle.push({ tipo: item.tipo, accion: 'actualizado' });
      }

      if (!item.conProfesor) continue;

      const yaTieneProf = (taller.profesores?.length ?? 0) > 0;
      if (yaTieneProf) {
        const det = result.detalle.find((d) => d.tipo === item.tipo);
        if (det) det.profesor = taller.profesores![0].nombre;
        continue;
      }

      const prof = await this.resolverProfesor(item, sinTaller, hash, salt);
      if (prof) {
        const esNuevo = !prof.id;
        prof.tallerId = taller.id;
        if (!prof.passwordHash) {
          prof.passwordHash = hash;
          prof.passwordSalt = salt;
        }
        await this.profesorRepo.save(prof);
        if (esNuevo) result.profesoresCreados++;
        result.profesoresAsignados++;
        const det = result.detalle.find((d) => d.tipo === item.tipo);
        if (det) det.profesor = prof.nombre;
      }
    }

    return result;
  }

  /** Sincroniza bloques horarios oficiales y limpia horarios de talleres fuera del catálogo. */
  /**
   * Sincroniza bloques horarios oficiales por taller.
   * Fuente: HORARIOS_OFICIALES_TALLERES en common/horarios-oficiales.pool.ts
   * Borra horarios previos del taller y carga los nuevos.
   */
  async seedHorariosOficiales(): Promise<SeedHorariosOficialesResult> {
    const talleres = await this.tallerRepo.find();
    const porNombre = new Map<string, Taller>();
    for (const t of talleres) {
      porNombre.set(normalizarNombreTaller(t.tipo), t);
    }

    const result: SeedHorariosOficialesResult = {
      actualizados: [],
      bloquesCargados: 0,
      noEncontrados: [],
    };

    for (const item of HORARIOS_OFICIALES_TALLERES) {
      const claves = [
        normalizarNombreTaller(item.tipo),
        ...(item.alias ?? []).map(normalizarNombreTaller),
      ];
      const taller = claves.map((k) => porNombre.get(k)).find(Boolean);
      if (!taller) {
        result.noEncontrados.push(item.tipo);
        continue;
      }

      await this.horarioRepo.delete({ tallerId: taller.id });

      const entities = item.bloques.map((b) =>
        this.horarioRepo.create({
          tallerId: taller.id,
          curso: null,
          seccion: `${b.diaSemana}|${b.horaInicio}`,
          diaSemana: b.diaSemana,
          horaInicio: `${b.horaInicio}:00`,
          horaFin: `${b.horaFin}:00`,
        }),
      );
      await this.horarioRepo.save(entities);
      result.bloquesCargados += entities.length;

      const primero = item.bloques[0];
      taller.diaSemana = primero.diaSemana;
      taller.horaInicio = `${primero.horaInicio}:00`;
      taller.horaFin = `${primero.horaFin}:00`;
      taller.modoHorario = 'POR_SECCION';
      await this.tallerRepo.save(taller);

      result.actualizados.push(taller.tipo);
    }

    const idsConHorarioOficial = new Set(
      result.actualizados
        .map((tipo) => talleres.find((t) => t.tipo === tipo)?.id)
        .filter((id): id is number => id != null),
    );

    for (const taller of talleres) {
      if (idsConHorarioOficial.has(taller.id)) continue;
      await this.horarioRepo.delete({ tallerId: taller.id });
      taller.diaSemana = null;
      taller.horaInicio = null;
      taller.horaFin = null;
      await this.tallerRepo.save(taller);
    }

    return result;
  }

  private aliasDe(tipo: string): string[] {
    return [normalizarNombreTaller(tipo)];
  }

  private async resolverProfesor(
    item: TallerCatalogoSeed,
    sinTaller: Profesor[],
    hash: string,
    salt: string,
  ): Promise<Profesor | null> {
    if (item.profesor) {
      const porEmail = await this.profesorRepo.findOne({
        where: { email: item.profesor.email },
      });
      if (porEmail) return porEmail;

      const todos = await this.profesorRepo.find();
      const rutNorm = item.profesor.rut.replace(/\./g, '').toUpperCase();
      const porRut = todos.find(
        (p) => p.rut.replace(/\./g, '').toUpperCase() === rutNorm,
      );
      if (porRut) return porRut;

      return this.profesorRepo.create({
        nombre: item.profesor.nombre,
        rut: item.profesor.rut,
        email: item.profesor.email,
        passwordHash: hash,
        passwordSalt: salt,
      });
    }

    return sinTaller.shift() ?? null;
  }
}
