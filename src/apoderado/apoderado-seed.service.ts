/**
 * =============================================================================
 * apoderado/apoderado-seed.service.ts — SEED / MIGRACIÓN DE DATOS DE APODERADOS
 * =============================================================================
 * Utilidades para poblar o limpiar datos de apoderados en la tabla alumnos:
 *
 *   seedMissingApoderados()     → completa nombre/RUT/email/password faltantes
 *   actualizarNombresApoderados() → reemplaza nombres/emails genéricos
 *   migrarEmailsGmail()         → cambia @email.com → @gmail.com
 *
 * Usa pools de nombres y RUTs (common/apoderado-*.pool) y hashPassword('12345').
 * =============================================================================
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alumno } from '../entities/alumno.entity';
import { Profesor } from '../entities/profesor.entity';
// Pool de RUTs válidos para asignar a apoderados sin colisiones
import { APODERADO_RUT_POOL } from '../common/apoderado-ruts.pool';
// Nombres + helpers para detectar emails/nombres genéricos
import {
  APODERADO_NOMBRES_POOL,
  emailDesdeNombreApoderado,
  esEmailApoderadoGenerico,
  esNombreApoderadoGenerico,
} from '../common/apoderado-nombres.pool';
// hashPassword('12345') = contraseña por defecto del sistema
import { hashPassword } from '../common/password.util';

/** Resultado de operaciones de seed o migración de apoderados. */
export interface SeedApoderadosResult {
  actualizados: number;
  omitidos: number;
  rutPoolAgotado: boolean;
  detalle: Array<{ alumnoId: number; nombre: string; apoderadoNombre: string; apoderadoRut: string; apoderadoEmail: string }>;
}

/** Completa y normaliza datos de apoderados asociados a alumnos. */
@Injectable()
export class ApoderadoSeedService {
  constructor(
    @InjectRepository(Alumno)
    private alumnoRepo: Repository<Alumno>,
    @InjectRepository(Profesor)
    private profesorRepo: Repository<Profesor>,
  ) {}

  /**
   * Asigna nombre, RUT, email y contraseña a alumnos con datos de apoderado incompletos.
   * Evita colisiones de RUT con alumnos/profesores ya existentes.
   */
  async seedMissingApoderados(): Promise<SeedApoderadosResult> {
    const usados = new Set<string>();
    const alumnos = await this.alumnoRepo.find();
    for (const a of alumnos) {
      if (a.rut) usados.add(a.rut);
      if (a.apoderadoRut) usados.add(a.apoderadoRut);
    }
    const profesores = await this.profesorRepo.find();
    for (const p of profesores) {
      if (p.rut) usados.add(p.rut);
    }

    const disponibles = APODERADO_RUT_POOL.filter((r) => !usados.has(r));
    let poolIdx = 0;
    let nombreIdx = 0;
    const emailsUsados = new Set<string>();
    for (const a of alumnos) {
      if (a.apoderadoEmail?.trim() && !esEmailApoderadoGenerico(a.apoderadoEmail)) {
        emailsUsados.add(a.apoderadoEmail.trim().toLowerCase());
      }
    }

    const detalle: SeedApoderadosResult['detalle'] = [];
    let actualizados = 0;
    let omitidos = 0;

    // Contraseña por defecto del sistema (igual que auth)
    const { hash, salt } = hashPassword('12345');

    for (const alumno of alumnos) {
      const incompleto =
        !alumno.apoderadoNombre?.trim() ||
        !alumno.apoderadoEmail?.trim() ||
        !alumno.apoderadoRut?.trim();

      if (!incompleto) {
        omitidos++;
        continue;
      }

      if (poolIdx >= disponibles.length) {
        break; // se acabaron los RUTs del pool
      }

      const rut = disponibles[poolIdx++];
      usados.add(rut);

      if (!alumno.apoderadoNombre?.trim()) {
        alumno.apoderadoNombre = this.nextNombre(nombreIdx++);
      }
      if (!alumno.apoderadoEmail?.trim()) {
        alumno.apoderadoEmail = emailDesdeNombreApoderado(alumno.apoderadoNombre!, emailsUsados);
      }
      if (!alumno.apoderadoRut?.trim()) {
        alumno.apoderadoRut = rut;
      }
      if (!alumno.apoderadoPasswordHash || !alumno.apoderadoPasswordSalt) {
        alumno.apoderadoPasswordHash = hash;
        alumno.apoderadoPasswordSalt = salt;
      }

      await this.alumnoRepo.save(alumno);
      actualizados++;
      detalle.push({
        alumnoId: alumno.id,
        nombre: alumno.nombre,
        apoderadoNombre: alumno.apoderadoNombre!,
        apoderadoRut: alumno.apoderadoRut!,
        apoderadoEmail: alumno.apoderadoEmail!,
      });
    }

    return {
      actualizados,
      omitidos,
      rutPoolAgotado: poolIdx >= disponibles.length && alumnos.some(
        (a) =>
          !a.apoderadoNombre?.trim() ||
          !a.apoderadoEmail?.trim() ||
          !a.apoderadoRut?.trim(),
      ),
      detalle,
    };
  }

  /** Reemplaza nombres/emails genéricos (Apoderado de…, apoderado.N@…) por nombres reales. */
  async actualizarNombresApoderados(): Promise<SeedApoderadosResult> {
    const alumnos = await this.alumnoRepo.find({ order: { id: 'ASC' } });
    const emailsUsados = new Set<string>();
    for (const a of alumnos) {
      if (a.apoderadoEmail?.trim() && !esEmailApoderadoGenerico(a.apoderadoEmail)) {
        emailsUsados.add(a.apoderadoEmail.trim().toLowerCase());
      }
    }

    let nombreIdx = 0;
    const detalle: SeedApoderadosResult['detalle'] = [];
    let actualizados = 0;
    let omitidos = 0;

    for (const alumno of alumnos) {
      const nombreGenerico = esNombreApoderadoGenerico(alumno.apoderadoNombre);
      const emailGenerico = esEmailApoderadoGenerico(alumno.apoderadoEmail);
      if (!nombreGenerico && !emailGenerico) {
        omitidos++;
        continue;
      }

      if (nombreGenerico) {
        alumno.apoderadoNombre = this.nextNombre(nombreIdx++);
      }
      if (emailGenerico) {
        alumno.apoderadoEmail = emailDesdeNombreApoderado(alumno.apoderadoNombre!, emailsUsados);
      }

      await this.alumnoRepo.save(alumno);
      actualizados++;
      detalle.push({
        alumnoId: alumno.id,
        nombre: alumno.nombre,
        apoderadoNombre: alumno.apoderadoNombre!,
        apoderadoRut: alumno.apoderadoRut ?? '',
        apoderadoEmail: alumno.apoderadoEmail!,
      });
    }

    return {
      actualizados,
      omitidos,
      rutPoolAgotado: false,
      detalle,
    };
  }

  /** Toma el siguiente nombre del pool (cíclico con %). */
  private nextNombre(index: number): string {
    return APODERADO_NOMBRES_POOL[index % APODERADO_NOMBRES_POOL.length];
  }

  /** Cambia apoderado_email de @email.com a @gmail.com (evitando duplicados). */
  async migrarEmailsGmail(): Promise<SeedApoderadosResult> {
    const alumnos = await this.alumnoRepo.find({ order: { id: 'ASC' } });
    const emailsUsados = new Set<string>();
    for (const a of alumnos) {
      const e = a.apoderadoEmail?.trim().toLowerCase();
      if (e && !/@email\.com$/i.test(e)) {
        emailsUsados.add(e);
      }
    }

    const detalle: SeedApoderadosResult['detalle'] = [];
    let actualizados = 0;
    let omitidos = 0;

    for (const alumno of alumnos) {
      const email = alumno.apoderadoEmail?.trim();
      if (!email || !/@email\.com$/i.test(email)) {
        omitidos++;
        continue;
      }

      const local = email.replace(/@email\.com$/i, '');
      let nuevo = `${local}@gmail.com`.toLowerCase();
      let n = 2;
      while (emailsUsados.has(nuevo)) {
        nuevo = `${local}${n}@gmail.com`;
        n++;
      }
      emailsUsados.add(nuevo);
      alumno.apoderadoEmail = nuevo;
      await this.alumnoRepo.save(alumno);
      actualizados++;
      detalle.push({
        alumnoId: alumno.id,
        nombre: alumno.nombre,
        apoderadoNombre: alumno.apoderadoNombre ?? '',
        apoderadoRut: alumno.apoderadoRut ?? '',
        apoderadoEmail: nuevo,
      });
    }

    return { actualizados, omitidos, rutPoolAgotado: false, detalle };
  }
}
