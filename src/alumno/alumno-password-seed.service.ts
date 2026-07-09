/**
 * Servicio de seed para contraseñas de alumnos.
 * Inicializa credenciales por defecto en registros sin hash o salt válidos.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alumno } from '../entities/alumno.entity';
import { defaultPassword, hashPassword, needsPasswordInit } from '../common/password.util';

/** Resultado del proceso de seed de contraseñas en alumnos. */
export interface SeedAlumnoPasswordsResult {
  actualizados: number;
  omitidos: number;
  detalle: Array<{ alumnoId: number; nombre: string; rut: string }>;
}

/** Inicializa contraseñas faltantes en el catálogo de alumnos. */
@Injectable()
export class AlumnoPasswordSeedService {
  constructor(
    @InjectRepository(Alumno)
    private alumnoRepo: Repository<Alumno>,
  ) {}

  /** Recorre alumnos y asigna contraseña por defecto a quienes no tienen credenciales. */
  async seedMissingPasswords(): Promise<SeedAlumnoPasswordsResult> {
    const alumnos = await this.alumnoRepo.find({ order: { id: 'ASC' } });
    const detalle: SeedAlumnoPasswordsResult['detalle'] = [];
    let actualizados = 0;
    let omitidos = 0;

    const password = defaultPassword();
    const { hash, salt } = hashPassword(password);

    for (const alumno of alumnos) {
      if (!needsPasswordInit(alumno.passwordHash) && alumno.passwordSalt?.trim()) {
        omitidos++;
        continue;
      }

      alumno.passwordHash = hash;
      alumno.passwordSalt = salt;
      await this.alumnoRepo.save(alumno);
      actualizados++;
      detalle.push({
        alumnoId: alumno.id,
        nombre: alumno.nombre,
        rut: alumno.rut,
      });
    }

    return { actualizados, omitidos, detalle };
  }
}
